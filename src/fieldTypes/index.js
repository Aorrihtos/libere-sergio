import * as date from './date.js';
import * as string from './string.js';
import * as time from './time.js';

// Single source of truth for supported order-field types. Add a new type by
// adding one entry here (plus its validator module) — nothing else changes.
const fieldTypeRegistry = {
  date,
  string,
  time,
};

export function isKnownFieldType(type) {
  return Object.prototype.hasOwnProperty.call(fieldTypeRegistry, type);
}

export function validateFieldValue(type, value) {
  const validator = fieldTypeRegistry[type];
  if (!validator) {
    return { valid: false, error: `Unknown field type: ${type}` };
  }
  return validator.validate(value);
}
