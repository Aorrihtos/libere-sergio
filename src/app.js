import express from 'express';
import v1Router from './api/v1/index.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { seedProducts } from './seed/products.seed.js';
import { createProduct } from './services/products.service.js';

seedProducts(createProduct);

export const app = express();

app.use(express.json());
app.use('/api/v1', v1Router);
app.use(errorHandler);
