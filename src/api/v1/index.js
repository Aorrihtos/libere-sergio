import { Router } from 'express';
import productsRouter from './products.routes.js';
import ordersRouter from './orders.routes.js';

// Aggregates all v1 routes. A future v2 = a parallel src/api/v2/index.js
// mounted separately in app.js, reusing whichever controllers didn't change.
const router = Router();

router.use('/products', productsRouter);
router.use('/orders', ordersRouter);

export default router;
