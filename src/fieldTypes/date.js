const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function validate(value) {
  if (typeof value !== 'string' || !DATE_PATTERN.test(value)) {
    return { valid: false, error: 'Must be a date string in YYYY-MM-DD format' };
  }
  if (Number.isNaN(new Date(value).getTime())) {
    return { valid: false, error: 'Must be a valid calendar date' };
  }
  return { valid: true };
}
