import * as ordersService from '../services/orders.service.js';

export function createOrder(req, res, next) {
  try {
    const order = ordersService.createOrder(req.body ?? {});
    res.status(201).json({ order_id: order.id });
  } catch (err) {
    next(err);
  }
}
