import type { Application } from 'express';
import { loginRequired } from '../controllers/authController';
import * as productController from '../controllers/productController';
import { checkCacheMiddleware as checkCache } from '../cache';

export default (app: Application) => {
	app
		.route('/products/:barcode')
		.get(
			loginRequired,
			checkCache('products', 'barcode'),
			productController.getProductInfo
		);
};
