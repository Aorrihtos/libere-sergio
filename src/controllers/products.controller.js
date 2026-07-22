import * as productsService from '../services/products.service.js';
import { ValidationError } from '../middlewares/errorHandler.js';

export async function listActiveProducts(req, res, next) {
  try {
    const reservationId = req.query.reservation_id;
    if (typeof reservationId !== 'string' || reservationId.trim().length === 0) {
      throw new ValidationError('reservation_id query parameter is required', []);
    }

    const products = await productsService.listActiveProducts(reservationId);
    const projected = products.map(({ id, name, description, dateAdded, price }) => ({
      id,
      name,
      description,
      dateAdded,
      price,
    }));
    res.status(200).json({ products: projected });
  } catch (err) {
    next(err);
  }
}

export function getProductById(req, res, next) {
  try {
    const product = productsService.getProductById(req.params.id);
    res.status(200).json(product);
  } catch (err) {
    next(err);
  }
}

export function createProduct(req, res, next) {
  try {
    const product = productsService.createProduct(req.body);
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
}
