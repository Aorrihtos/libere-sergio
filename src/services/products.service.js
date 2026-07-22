import * as productsRepository from '../repositories/products.repository.js';
import { isKnownFieldType } from '../fieldTypes/index.js';
import { relevanceStrategy } from '../relevance/index.js';
import { ValidationError, NotFoundError } from '../middlewares/errorHandler.js';

export async function listActiveProducts(reservationId) {
  const activeProducts = productsRepository.findAll().filter((product) => product.active);
  return relevanceStrategy.rank(activeProducts, reservationId);
}

export function getProductById(id) {
  const product = productsRepository.findById(id);
  if (!product) {
    throw new NotFoundError('Product not found');
  }
  return product;
}

export function createProduct(payload) {
  const details = [];

  if (typeof payload.name !== 'string' || payload.name.trim().length === 0) {
    details.push({ field: 'name', message: 'Must be a non-empty string' });
  }
  if (typeof payload.description !== 'string' || payload.description.trim().length === 0) {
    details.push({ field: 'description', message: 'Must be a non-empty string' });
  }
  if (typeof payload.price !== 'number' || payload.price < 0) {
    details.push({ field: 'price', message: 'Must be a number >= 0' });
  }

  if (!Array.isArray(payload.order_fields)) {
    details.push({ field: 'order_fields', message: 'Must be an array' });
  } else {
    payload.order_fields.forEach((orderField, index) => {
      if (typeof orderField?.name !== 'string' || orderField.name.trim().length === 0) {
        details.push({ field: `order_fields[${index}].name`, message: 'Must be a non-empty string' });
      }
      if (!isKnownFieldType(orderField?.type)) {
        details.push({ field: `order_fields[${index}].type`, message: `Unknown field type: ${orderField?.type}` });
      }
    });
  }

  if (details.length > 0) {
    throw new ValidationError('Invalid product payload', details);
  }

  return productsRepository.save(payload);
}
