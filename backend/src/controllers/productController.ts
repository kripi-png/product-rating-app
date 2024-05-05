import type { Request, Response } from 'express';
import type { IProduct } from '../types';

import { Product } from '../models/productModel';
import { redis } from '../cache';

export const getProductInfo = async (
	req: Request<{ barcode: string }>,
	res: Response<IProduct | { message: string }>
) => {
	try {
		/* preferably database already holds info of product */
		const product = await Product.findOne<IProduct>({
			_id: req.params.barcode,
		}).exec();

		if (product) {
			const cacheLifetimeDays = Number(process.env?.CACHE_LIFETIME_DAYS) || 2;
			redis
				.pipeline()
				.hset(`products:${product.barcode}`, {
					barcode: product.barcode,
					name: product.name,
					avgRating: product.avgRating ?? 0, // redis stores null as empty string
					createdAt: product.createdAt,
					updatedAt: product.updatedAt,
				})
				.expire(`products:${product.barcode}`, cacheLifetimeDays * 24 * 60 * 60)
				.exec();
			return res.status(200).json({
				barcode: product.barcode,
				name: product.name,
				avgRating: product.avgRating,
				createdAt: product.createdAt,
				updatedAt: product.updatedAt,
			});
		}

		/* try to find data on Open Food Facts (OFF) */
		console.log('product', req.params.barcode, 'not found. checking OFF');
		const offUrl = `https://world.openfoodfacts.org/api/v3/product/${req.params.barcode}.json?fields=code,product_name_en`;
		const offResponse = await fetch(offUrl)
			.then(async (r) => await r.json())
			.catch((err: any) => {
				console.error('openfoodfacts fetch error:', err);
			});

		/* in case even OFF didn't have the product data, inform the user and suggest submitting product info */
		if (!offResponse || offResponse.result.id === 'product_not_found') {
			console.log('not found');
			return res.status(404).json({
				message: 'product not found. consider submitting product information.',
			});
		}

		/* if OFF had the data, create a db entry for it */
		if (offResponse && offResponse.product) {
			const newProduct = new Product<IProduct>({
				barcode: offResponse.product.code,
				name: offResponse.product.product_name_en,
			});

			newProduct
				.save()
				.then((product) => {
					console.log('new product:', product.barcode);
					return res.status(201).send({ message: 'created' });
				})
				.catch((err) => {
					console.error(
						`error while saving product ${req.params.barcode}: ${err}`
					);
					return res.status(500).send({
						message: err,
					});
				});
		}
	} catch (err: any) {
		console.error(err);
		return res.status(400).send({ message: err.message });
	}
};

export const addProductInformation = async (
	req: Request<{}, {}, IProduct>,
	res: Response
) => {
	try {
		if (await Product.exists({ barcode: req.body.barcode })) {
			return res.status(400).json({
				message: `product with barcode ${req.body.barcode} already exists.`,
			});
		}
		const newProduct = new Product<IProduct>(req.body);
		newProduct
			.save()
			.then((product) => {
				return res.status(201).json(product);
			})
			.catch((err) => {
				console.error('error while saving a new product');
				return res.status(500).send({ message: err });
			});
	} catch (err: any) {
		console.error(err);
		return res.status(400).send({ message: err.message });
	}
};
