import { encrypt, decrypt, isEncrypted, decryptDeep } from '../../src/utils/phi-crypto';

describe('phi-crypto', () => {
  it('round-trips a value through encrypt/decrypt', () => {
    const plain = 'Patient reports chest pain radiating to left arm.';
    const ct = encrypt(plain);
    expect(ct).not.toBe(plain);
    expect(isEncrypted(ct)).toBe(true);
    expect(ct.startsWith('enc:v1:')).toBe(true);
    expect(decrypt(ct)).toBe(plain);
  });

  it('produces a unique ciphertext each call (random IV)', () => {
    expect(encrypt('same input')).not.toBe(encrypt('same input'));
  });

  it('never double-encrypts', () => {
    const once = encrypt('x');
    expect(encrypt(once)).toBe(once);
  });

  it('passes legacy plaintext through decrypt unchanged', () => {
    expect(decrypt('not encrypted, pre-existing row')).toBe('not encrypted, pre-existing row');
  });

  it('decryptDeep decrypts nested + arrays, leaves plain values and Dates', () => {
    const now = new Date();
    const tree = {
      a: encrypt('alpha'),
      plain: 'beta',
      when: now,
      list: [{ s: encrypt('gamma') }, 'delta'],
    };
    const out = decryptDeep(tree);
    expect(out.a).toBe('alpha');
    expect(out.plain).toBe('beta');
    expect(out.when).toBe(now);
    expect((out.list[0] as { s: string }).s).toBe('gamma');
    expect(out.list[1]).toBe('delta');
  });
});
