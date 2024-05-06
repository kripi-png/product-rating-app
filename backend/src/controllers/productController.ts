import type { Request, Response } from 'express';
import type { APIResponse, IProduct, ResProduct } from '../types';

import { Product } from '../models/productModel';
import { redis } from '../cache';

export const getProductInfo = async (
	req: Request<{ barcode: string }>,
	res: Response<APIResponse<ResProduct>>
) => {
	try {
		/* preferably database already holds info of product */
		const products: IProduct[] = await Product.aggregate()
			.match({ _id: req.params.barcode })
			// calculate average rating
			.lookup({
				from: 'reviews',
				localField: '_id',
				foreignField: 'productId',
				as: 'reviews',
			})
			.addFields({
				avgRating: { $avg: '$reviews.rating' },
			})
			// exclude reviews list generated at $lookup from the end result
			.project({ reviews: 0 })
			.exec();

		const product = products[0];
		if (product) {
			// substring to take the number with two decimals, if possible
			product.avgRating = Number(
				product.avgRating?.toString().substring(0, 4) ?? 0
			);
			const cacheLifetimeDays = Number(process.env?.CACHE_LIFETIME_DAYS) || 2;
			// both cache and return the data
			const prepareResponse: ResProduct = {
				barcode: product._id,
				name: product.name,
				avgRating: product.avgRating,
				createdAt: <Date>product.createdAt,
				updatedAt: <Date>product.updatedAt,
			};
			redis
				.pipeline()
				.hset(`products:${product._id}`, prepareResponse)
				.expire(`products:${product.barcode}`, cacheLifetimeDays * 24 * 60 * 60)
				.exec();
			return res.status(200).json(prepareResponse);
		}

		/* try to find data on Open Food Facts (OFF) */
		console.log(
			'product',
			req.params.barcode,
			'not found in database. Checking Open Food Facts.'
		);
		const fields = 'code,product_name_en';
		const offUrl = `https://world.openfoodfacts.org/api/v3/product/${req.params.barcode}.json?fields=${fields}`;
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
				_id: offResponse.product.code,
				name: offResponse.product.product_name_en,
			});

			newProduct
				.save()
				.then((product) => {
					console.log('new product:', product._id);
					return res.status(201).json({
						barcode: product._id,
						name: product.name,
						avgRating: 0,
						createdAt: <Date>product.createdAt,
						updatedAt: <Date>product.updatedAt,
					});
				})
				.catch((err) => {
					console.error(`error saving product ${req.params.barcode}: ${err}`);
					return res.status(500).json({
						message: err,
					});
				});
		}
	} catch (err: any) {
		console.error(err);
		return res.status(400).json({ message: err.message });
	}
};

export const addProductInformation = async (
	req: Request<{}, {}, { barcode: string; name: string }>,
	res: Response<APIResponse<ResProduct>>
) => {
	try {
		const newProduct = new Product<IProduct>({
			_id: req.body.barcode,
			name: req.body.name,
		});
		newProduct
			.save()
			.then((product) => {
				return res.status(201).json({
					barcode: product._id,
					name: product.name,
					avgRating: 0,
					createdAt: <Date>product.createdAt,
					updatedAt: <Date>product.updatedAt,
				});
			})
			.catch((err) => {
				console.error('error while saving a new product');
				return res.status(500).json({ message: err });
			});
	} catch (err: any) {
		console.error(err);
		return res.status(400).json({ message: err.message });
	}
};
