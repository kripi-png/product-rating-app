import type { Request, Response } from 'express';
import type { IReview } from '../types';

import { Review } from '../models/reviewModel';
// import { redis } from '../cache';

export const postReview = async (
	req: Request<{}, {}, IReview>,
	res: Response
) => {
	try {
		const newReview = new Review(req.body);
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
