export function userKey(baseKey, email) {
  const safe = String(email || "").trim().toLowerCase();
  if (!safe) return baseKey;
  return `${baseKey}:${safe}`;
}

export function loadUser(baseKey, email, fallback) {
  const key = userKey(baseKey, email);
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : fallback;
}

export function saveUser(baseKey, email, value) {
  const key = userKey(baseKey, email);
  localStorage.setItem(key, JSON.stringify(value));
}