/**
 * MitID integration via Criipto Verify (godkendt MitID broker).
 *
 * Criipto bruger OpenID Connect (OIDC) standarden.
 * I test-mode bruges Criipto's MitID-simulator.
 * I produktion skiftes blot til production-credentials.
 *
 * Opsætning:
 * 1. Opret gratis konto på https://dashboard.criipto.com
 * 2. Opret en "Application" og vælg MitID som identity source
 * 3. Sæt redirect URI til: trygkode://auth/callback
 * 4. Kopier Domain og Client ID herunder
 */

const ENV = __DEV__ ? 'test' : 'production';

interface MitIDConfig {
  domain: string;
  clientId: string;
  redirectUri: string;
  scopes: string[];
  acrValues: string;
}

const configs: Record<string, MitIDConfig> = {
  test: {
    // Criipto test-tenant — erstat med dine egne credentials fra dashboard.criipto.com
    domain: 'trygkode-test.criipto.id',
    clientId: 'urn:trygkode:test',
    redirectUri: 'trygkode://auth/callback',
    scopes: ['openid'],
    // MitID via Criipto — urn:grn:authn:dk:mitid:substantial kræver rigtig MitID
    // I test bruger vi low som tillader Criipto's simulator
    acrValues: 'urn:grn:authn:dk:mitid:low',
  },
  production: {
    domain: 'trygkode.criipto.id',
    clientId: 'urn:trygkode:production',
    redirectUri: 'trygkode://auth/callback',
    scopes: ['openid'],
    acrValues: 'urn:grn:authn:dk:mitid:substantial',
  },
};

export const mitidConfig = configs[ENV];

export const MITID_DISCOVERY_URL = `https://${mitidConfig.domain}/.well-known/openid-configuration`;
