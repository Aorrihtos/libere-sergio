import { Router } from 'express';
import * as ordersController from '../../controllers/orders.controller.js';

const router = Router();

router.post('/', ordersController.createOrder);

export default router;
