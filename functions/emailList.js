// Users paste lists like "a@x.com; b@x.com" (Outlook-style, semicolons) —
// accept both ; and , as separators.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const parseEmailList = (raw) => {
  if (!raw) return [];
  return String(raw).split(/[;,]/).map(s => s.trim()).filter(Boolean);
};

// Empty input is valid (field is optional) — pass requireNonEmpty:true for
// fields like "to" that must have at least one address.
export const isValidEmailList = (raw, { requireNonEmpty = false } = {}) => {
  const list = parseEmailList(raw);
  if (list.length === 0) return !requireNonEmpty;
  return list.every(e => EMAIL_RE.test(e));
};
