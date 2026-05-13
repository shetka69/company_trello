export function sessionSecret() {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 32) {
    throw new Error("AUTH_SECRET must be set and contain at least 32 characters.");
  }

  return new TextEncoder().encode(value);
}
