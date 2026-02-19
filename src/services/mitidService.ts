import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { mitidConfig, MITID_DISCOVERY_URL } from '../config/mitid';

WebBrowser.maybeCompleteAuthSession();

export interface MitIDUserInfo {
  sub: string;            // Unikt bruger-ID fra MitID
  name?: string;          // Fulde navn
  birthdate?: string;     // Fødselsdato
  cprNumberIdentifier?: string; // CPR-relateret ID (anonymiseret)
  mitidVerified: boolean;
}

interface TokenPayload {
  sub: string;
  name?: string;
  birthdate?: string;
  'dk.cpr'?: string;
  iss: string;
  aud: string;
  exp: number;
  iat: number;
  acr: string;
}

function decodeJwtPayload(token: string): TokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) base64 += '=';

    const jsonPayload = atob(base64);
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

function isTokenExpired(payload: TokenPayload): boolean {
  return Date.now() >= payload.exp * 1000;
}

export class MitIDService {
  private discovery: AuthSession.DiscoveryDocument | null = null;

  /**
   * Hent OIDC discovery-dokument fra Criipto.
   * Indeholder endpoints til authorization, token-udveksling m.m.
   */
  async getDiscovery(): Promise<AuthSession.DiscoveryDocument> {
    if (this.discovery) return this.discovery;

    const discovery = await AuthSession.fetchDiscoveryAsync(MITID_DISCOVERY_URL);
    this.discovery = discovery;
    return discovery;
  }

  /**
   * Opret en OIDC authorization request med PKCE.
   * PKCE (Proof Key for Code Exchange) sikrer at kun vores app
   * kan udveksle authorization code for tokens.
   */
  createAuthRequest(): AuthSession.AuthRequest {
    return new AuthSession.AuthRequest({
      clientId: mitidConfig.clientId,
      redirectUri: mitidConfig.redirectUri,
      scopes: mitidConfig.scopes,
      responseType: AuthSession.ResponseType.Code,
      usePKCE: true,
      extraParams: {
        acr_values: mitidConfig.acrValues,
        ui_locales: 'da',
      },
    });
  }

  /**
   * Kør det fulde MitID-login flow:
   * 1. Åbn MitID-login i browser
   * 2. Bruger logger ind med MitID
   * 3. Vi modtager authorization code
   * 4. Vi udveksler code for tokens via PKCE
   * 5. Vi dekoder og returnerer brugerinfo
   */
  async authenticate(): Promise<MitIDUserInfo> {
    const discovery = await this.getDiscovery();
    const request = this.createAuthRequest();

    const result = await request.promptAsync(discovery);

    if (result.type === 'cancel' || result.type === 'dismiss') {
      throw new MitIDError('LOGIN_CANCELLED', 'Login blev annulleret');
    }

    if (result.type === 'error') {
      throw new MitIDError(
        'AUTH_ERROR',
        result.error?.message || 'Der opstod en fejl under MitID-login'
      );
    }

    if (result.type !== 'success' || !result.params.code) {
      throw new MitIDError('NO_CODE', 'Ingen authorization code modtaget fra MitID');
    }

    const tokenResponse = await AuthSession.exchangeCodeAsync(
      {
        clientId: mitidConfig.clientId,
        code: result.params.code,
        redirectUri: mitidConfig.redirectUri,
        extraParams: {
          code_verifier: request.codeVerifier || '',
        },
      },
      discovery
    );

    if (!tokenResponse.idToken) {
      throw new MitIDError('NO_TOKEN', 'Ingen ID-token modtaget fra MitID');
    }

    const payload = decodeJwtPayload(tokenResponse.idToken);
    if (!payload) {
      throw new MitIDError('INVALID_TOKEN', 'Ugyldigt token fra MitID');
    }

    if (isTokenExpired(payload)) {
      throw new MitIDError('EXPIRED_TOKEN', 'Token fra MitID er udløbet');
    }

    return {
      sub: payload.sub,
      name: payload.name,
      birthdate: payload.birthdate,
      cprNumberIdentifier: payload['dk.cpr'],
      mitidVerified: true,
    };
  }
}

export class MitIDError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = 'MitIDError';
  }
}

export const mitidService = new MitIDService();
