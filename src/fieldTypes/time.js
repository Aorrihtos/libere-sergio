const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function validate(value) {
  if (typeof value !== 'string' || !TIME_PATTERN.test(value)) {
    return { valid: false, error: 'Must be a time string in HH:MM (24h) format' };
  }
  return { valid: true };
}
