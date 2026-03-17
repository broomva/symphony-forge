import { randomBytes } from "node:crypto";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { decrypt, encrypt } from "../lib/crypto";

describe("crypto – encrypt / decrypt", () => {
  const originalEnv = process.env.ENCRYPTION_KEY;

  beforeEach(() => {
    // Generate a fresh 32-byte key for each test
    process.env.ENCRYPTION_KEY = randomBytes(32).toString("base64");
  });

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.ENCRYPTION_KEY = originalEnv;
    } else {
      process.env.ENCRYPTION_KEY = undefined;
    }
  });

  test("roundtrip: encrypt then decrypt recovers plaintext", () => {
    const plaintext = "hello world";
    const ciphertext = encrypt(plaintext);
    expect(decrypt(ciphertext)).toBe(plaintext);
  });

  test("different plaintexts produce different ciphertexts (random IV)", () => {
    const a = encrypt("same-text");
    const b = encrypt("same-text");
    // With random IVs, the two ciphertexts should differ
    expect(a).not.toBe(b);
    // But both must decrypt to the same value
    expect(decrypt(a)).toBe("same-text");
    expect(decrypt(b)).toBe("same-text");
  });

  test("empty string roundtrips correctly", () => {
    const ciphertext = encrypt("");
    expect(decrypt(ciphertext)).toBe("");
  });

  test("unicode text roundtrips correctly", () => {
    const unicode = "Hello 🌍 Привет мир 你好世界";
    const ciphertext = encrypt(unicode);
    expect(decrypt(ciphertext)).toBe(unicode);
  });

  test("tampered ciphertext fails with error", () => {
    const ciphertext = encrypt("secret");
    const buf = Buffer.from(ciphertext, "base64");

    // Corrupt the last byte of the ciphertext to invalidate the auth tag
    const lastIndex = buf.length - 1;
    buf[lastIndex] = (buf[lastIndex] + 1) % 256;
    const tampered = buf.toString("base64");

    expect(() => decrypt(tampered)).toThrow();
  });

  test("missing ENCRYPTION_KEY throws descriptive error", () => {
    // biome-ignore lint/performance/noDelete: must truly remove env var, not set to "undefined" string
    delete process.env.ENCRYPTION_KEY;
    expect(() => encrypt("test")).toThrow("ENCRYPTION_KEY is not set");
  });

  test("wrong-length ENCRYPTION_KEY throws descriptive error", () => {
    process.env.ENCRYPTION_KEY = randomBytes(16).toString("base64"); // 16 bytes instead of 32
    expect(() => encrypt("test")).toThrow(
      "ENCRYPTION_KEY must be exactly 32 bytes"
    );
  });
});
