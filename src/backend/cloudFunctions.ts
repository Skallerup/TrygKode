/**
 * Cloud Functions specifikation til TrygKode backend.
 *
 * Disse funktioner skal deployes som Firebase Cloud Functions.
 * De håndterer den sikre server-side del af MitID-integrationen
 * og data-synkronisering.
 *
 * I udvikling bruger appen PKCE-flow direkte fra klienten.
 * I produktion bør token-udveksling gå via disse server-funktioner
 * for ekstra sikkerhed (client_secret opbevares kun på serveren).
 */

/**
 * POST /verifyMitIDToken
 *
 * Modtager en ID-token fra klienten og:
 * 1. Verificerer token-signatur mod Criipto's JWKS endpoint
 * 2. Validerer issuer, audience og expiry
 * 3. Opretter/opdaterer bruger i Firestore
 * 4. Returnerer en Firebase Custom Token til klienten
 *
 * Request body: { idToken: string }
 * Response: { firebaseToken: string, user: UserProfile }
 */
export interface VerifyMitIDRequest {
  idToken: string;
}

export interface VerifyMitIDResponse {
  firebaseToken: string;
  user: {
    uid: string;
    name: string;
    mitIdVerified: boolean;
    createdAt: string;
  };
}

/**
 * POST /syncContacts
 *
 * Synkroniserer en brugers kontakter til Firestore.
 * Krypterer kodeord med bruger-specifik nøgle inden lagring.
 *
 * Request: { contacts: EncryptedContact[] }
 * Response: { success: boolean }
 */
export interface SyncContactsRequest {
  contacts: {
    id: string;
    encryptedCodeWord: string;
    contactName: string;
    codeType: 'static' | 'rotating';
    createdAt: string;
    expiresAt?: string;
  }[];
}

/**
 * POST /sendCheckIn
 *
 * Sender en push-notifikation til en kontakt med en check-in påmindelse.
 *
 * Request: { targetUserId: string, senderName: string }
 * Response: { sent: boolean }
 */
export interface SendCheckInRequest {
  targetUserId: string;
  senderName: string;
}

/**
 * Firebase Cloud Functions implementation reference:
 *
 * ```typescript
 * // functions/src/index.ts
 * import * as functions from 'firebase-functions';
 * import * as admin from 'firebase-admin';
 * import * as jose from 'jose';
 *
 * admin.initializeApp();
 *
 * export const verifyMitIDToken = functions.https.onCall(async (data, context) => {
 *   const { idToken } = data;
 *
 *   // 1. Hent Criipto's JWKS (JSON Web Key Set)
 *   const JWKS = jose.createRemoteJWKSet(
 *     new URL('https://trygkode.criipto.id/.well-known/jwks')
 *   );
 *
 *   // 2. Verificer token
 *   const { payload } = await jose.jwtVerify(idToken, JWKS, {
 *     issuer: 'https://trygkode.criipto.id',
 *     audience: 'urn:trygkode:production',
 *   });
 *
 *   // 3. Opret/opdater bruger i Firestore
 *   const userRef = admin.firestore().doc(`users/${payload.sub}`);
 *   await userRef.set({
 *     name: payload.name,
 *     mitIdVerified: true,
 *     lastLogin: admin.firestore.FieldValue.serverTimestamp(),
 *   }, { merge: true });
 *
 *   // 4. Opret Firebase Custom Token
 *   const firebaseToken = await admin.auth().createCustomToken(payload.sub as string);
 *
 *   return { firebaseToken, user: { uid: payload.sub, name: payload.name, mitIdVerified: true } };
 * });
 * ```
 */
