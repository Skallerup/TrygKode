/**
 * Firebase konfiguration til TrygKode.
 *
 * Opsætning:
 * 1. Gå til https://console.firebase.google.com
 * 2. Opret et nyt projekt kaldet "TrygKode"
 * 3. Aktiver Authentication, Firestore og Cloud Functions
 * 4. Kopier Firebase-config herunder
 *
 * I udvikling bruger vi mock-data. Skift USE_FIREBASE til true
 * når Firebase-projekt er oprettet.
 */

export const USE_FIREBASE = false;

export const firebaseConfig = {
  apiKey: 'DIN-API-KEY',
  authDomain: 'trygkode.firebaseapp.com',
  projectId: 'trygkode',
  storageBucket: 'trygkode.appspot.com',
  messagingSenderId: '000000000000',
  appId: '1:000000000000:web:000000000000',
};
