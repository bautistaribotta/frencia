// Completa la WebCrypto API que Hermes no trae, usando expo-crypto.
// Supabase la necesita para PKCE: sin crypto.subtle.digest cae al metodo
// "plain" (sin sha256) y sin crypto.getRandomValues arma el verifier con
// Math.random. En web y en Node ya existe, asi que solo se rellena lo que falta.
import * as ExpoCrypto from 'expo-crypto';

type CryptoPolyfill = {
  getRandomValues?: typeof ExpoCrypto.getRandomValues;
  subtle?: { digest: typeof ExpoCrypto.digest };
};

const g = globalThis as unknown as { crypto?: CryptoPolyfill };
const crypto: CryptoPolyfill = g.crypto ?? {};

if (typeof crypto.getRandomValues !== 'function') {
  crypto.getRandomValues = ExpoCrypto.getRandomValues;
}

if (typeof crypto.subtle?.digest !== 'function') {
  crypto.subtle = {
    digest: (algorithm, data) => ExpoCrypto.digest(algorithm, data),
  };
}

if (!g.crypto) {
  g.crypto = crypto;
}
