// Small helpers around everything we keep in localStorage for an
// authenticated session: the JWT itself, and a couple of display bits.

const TOKEN_KEY = "whiteboard_user_token";
const EMAIL_KEY = "whiteboard_user_email";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function isAuthenticated() {
  return Boolean(getToken());
}

export function getStoredEmail() {
  return localStorage.getItem(EMAIL_KEY);
}

// Called right after a successful login/register response.
export function saveSession({ token, email }) {
  localStorage.setItem(TOKEN_KEY, token);
  if (email) {
    localStorage.setItem(EMAIL_KEY, email);
  }
}

// Called on logout, or automatically whenever the backend tells us
// the token is no longer valid (expired / tampered with).
export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EMAIL_KEY);
  localStorage.removeItem("canvas_id");
}
