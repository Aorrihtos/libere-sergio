export function validate(value) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return { valid: false, error: 'Must be a non-empty string' };
  }
  return { valid: true };
}
