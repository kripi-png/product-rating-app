import type { Request, Response } from 'express';
import type { IReview } from '../types';
import type { Types } from 'mongoose';

import { Review } from '../models/reviewModel';
import { Product } from '../models/productModel';
// import { redis } from '../cache';

interface IReqReview {
	productBarcode: string;
	productName: string;
	rating: Types.Decimal128;
	picture?: string;
	text?: string;
	tags?: string[];
}
export const postReview = async (
	req: Request<{}, {}, IReqReview>,
	res: Response<IReview | { message: string }>
) => {
	try {
		if (!(await Product.exists({ _id: req.body.productBarcode }))) {
			return res.status(404).json({
				message: `Cannot create a review for product that does not exist: ${req.body.productBarcode}`,
			});
		}

		if (!req.user?._id) {
			console.error('req.user missing _id?', req.user);
			return res.status(401).json({ message: 'Unauthorized' });
		}

		const reviewData: IReview = {
			productId: req.body.productBarcode,
			productName: req.body.productName,
			productBarcode: req.body.productBarcode,
			authorId: req.user?._id,
			rating: req.body.rating,
			// picture: req.body.picture,
			text: req.body.text ?? '',
			tags: req.body.tags ?? [],
			reactions: [],
		};

		const newReview = new Review(reviewData);
		newReview
			.save()
			.then((review) => {
				return res.status(201).json(review);
			})
			.catch((err) => {
				console.error('error while saving a new review');
				return res.status(500).send({ message: err });
			});
	} catch (err: any) {
		console.error(err);
		return res.status(400).send({ message: err.message });
	}
};
