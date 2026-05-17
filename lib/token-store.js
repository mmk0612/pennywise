const REFRESH_TOKEN_KEY = "pw_refresh_token";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

let accessTokenMemory = null;

function readCookie(name) {
  if (typeof document === "undefined") return null;
  const cookie = document.cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${name}=`));

  if (!cookie) return null;
  return decodeURIComponent(cookie.slice(name.length + 1));
}

function writeCookie(name, value, maxAgeSeconds = COOKIE_MAX_AGE_SECONDS) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; samesite=lax`;
}

function deleteCookie(name) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; max-age=0; samesite=lax`;
}

export function setAccessToken(token) {
  accessTokenMemory = token || null;
}

export function getAccessToken() {
  return accessTokenMemory;
}

export function clearAccessToken() {
  accessTokenMemory = null;
}

export function setRefreshTokenCookie(token) {
  if (!token) return;
  writeCookie(REFRESH_TOKEN_KEY, token);
}

export function getRefreshTokenCookie() {
  return readCookie(REFRESH_TOKEN_KEY);
}

export function clearRefreshTokenCookie() {
  deleteCookie(REFRESH_TOKEN_KEY);
}

export function clearAllAuthTokens() {
  clearAccessToken();
  clearRefreshTokenCookie();
}

export { REFRESH_TOKEN_KEY };
