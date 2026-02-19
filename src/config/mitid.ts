import * as AuthSession from 'expo-auth-session';
import { Platform } from 'react-native';

/**
 * MitID integration via Criipto Verify (godkendt MitID broker).
 *
 * Criipto bruger OpenID Connect (OIDC) standarden.
 * I test-mode bruges Criipto's MitID-simulator.
 * I produktion skiftes blot til production-credentials.
 *
 * VIGTIGT: Alle redirect URIs skal registreres i Criipto dashboard.
 */

const ENV = __DEV__ ? 'test' : 'production';

const webRedirectUri = AuthSession.makeRedirectUri({ preferLocalhost: true });
const nativeRedirectUri = 'trygkode://auth/callback';

const redirectUri = Platform.OS === 'web' ? webRedirectUri : nativeRedirectUri;

export interface MitIDConfig {
  domain: string;
  clientId: string;
  redirectUri: string;
  scopes: string[];
  acrValues: string;
}

const configs: Record<string, MitIDConfig> = {
  test: {
    domain: 'trygkode-test.criipto.id',
    clientId: 'urn:my:application:identifier:911071',
    redirectUri,
    scopes: ['openid'],
    acrValues: 'urn:grn:authn:dk:mitid:low',
  },
  production: {
    domain: 'trygkode.criipto.id',
    clientId: 'urn:trygkode:production',
    redirectUri,
    scopes: ['openid'],
    acrValues: 'urn:grn:authn:dk:mitid:substantial',
  },
};

export const mitidConfig = configs[ENV];

export const MITID_DISCOVERY_URL = `https://${mitidConfig.domain}/.well-known/openid-configuration`;
