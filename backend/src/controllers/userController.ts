import type { Request, Response } from 'express';
import type { APIResponse } from '../types';

import { Review } from '../models/reviewModel';
import { ReviewDocument } from '../interfaces/mongoose.gen';

export const getReviewsByUser = async (
	req: Request<{ userId: string }, {}, {}>,
	res: Response<APIResponse<ReviewDocument[]>>
) => {
	try {
		const userReviews = await Review.find({ authorId: req.params.userId })
			.exec()
			.catch((err) => {
				console.error(err);
				return null;
			});
		if (!userReviews) {
			return res
				.status(500)
				.json({ message: 'Error fetching reviews for user' });
		}
		return res.status(200).json(userReviews);
	} catch (err: any) {
		console.error(err);
		return res
			.status(500)
			.json({ message: 'Error fetching reviews: ' + err.message });
	}
};
