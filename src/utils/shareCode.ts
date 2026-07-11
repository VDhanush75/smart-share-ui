const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateShareCode(length = 6): string {
  const cryptoObj = typeof crypto !== "undefined" ? crypto : undefined;
  let code = "";
  if (cryptoObj && "getRandomValues" in cryptoObj) {
    const buf = new Uint32Array(length);
    cryptoObj.getRandomValues(buf);
    for (let i = 0; i < length; i++) {
      code += CHARS[buf[i] % CHARS.length];
    }
  } else {
    for (let i = 0; i < length; i++) {
      code += CHARS[Math.floor(Math.random() * CHARS.length)];
    }
  }
  return code;
}
