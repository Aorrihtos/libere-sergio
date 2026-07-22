import * as productsRepository from '../repositories/products.repository.js';
import * as ordersRepository from '../repositories/orders.repository.js';
import { validateFieldValue } from '../fieldTypes/index.js';
import { ValidationError, NotFoundError } from '../middlewares/errorHandler.js';

export function createOrder({ reservation_id: reservationId, product_id: productId, fields = {} }) {
  const topLevelDetails = [];
  if (typeof reservationId !== 'string' || reservationId.trim().length === 0) {
    topLevelDetails.push({ field: 'reservation_id', message: 'Must be a non-empty string' });
  }
  if (typeof productId !== 'string' || productId.trim().length === 0) {
    topLevelDetails.push({ field: 'product_id', message: 'Must be a non-empty string' });
  }
  if (topLevelDetails.length > 0) {
    throw new ValidationError('Invalid order payload', topLevelDetails);
  }

  const product = productsRepository.findById(productId);
  if (!product) {
    throw new NotFoundError('Product not found');
  }

  const details = [];
  const declaredNames = new Set(product.order_fields.map((orderField) => orderField.name));

  product.order_fields.forEach(({ name, type }) => {
    if (fields[name] === undefined) {
      details.push({ field: name, message: 'Field is required' });
      return;
    }
    const result = validateFieldValue(type, fields[name]);
    if (!result.valid) {
      details.push({ field: name, message: result.error });
    }
  });

  Object.keys(fields).forEach((name) => {
    if (!declaredNames.has(name)) {
      details.push({ field: name, message: 'Unknown field for this product' });
    }
  });

  if (details.length > 0) {
    throw new ValidationError('Invalid order fields', details);
  }

  const order = ordersRepository.save({ reservation_id: reservationId, product_id: productId, fields });
  productsRepository.incrementOrderCount(productId);
  return order;
}
