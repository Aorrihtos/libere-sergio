import { Router } from 'express';
import * as productsController from '../../controllers/products.controller.js';

const router = Router();

router.get('/', productsController.listActiveProducts);
router.get('/:id', productsController.getProductById);
router.post('/', productsController.createProduct);

export default router;
