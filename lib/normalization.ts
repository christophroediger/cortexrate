export function normalizeIdentityValue(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export function cleanObservedValue(value: string) {
  return value.trim().replace(/\s+/g, " ");
}
