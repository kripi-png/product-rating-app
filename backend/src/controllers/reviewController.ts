import type { Request, Response } from 'express';
import type {
	APIResponse,
	IReaction,
	IReview,
	ReactionIcon,
	ReqReview,
	ResReview,
	ResUser,
} from '../types';

import { Review } from '../models/reviewModel';
import { Product } from '../models/productModel';

const ALLOWED_REACTIONS: ReactionIcon[] = ['👍', '❤️', '✨'];

export const postReview = async (
	req: Request<{}, {}, ReqReview>,
	res: Response<APIResponse<ResReview>>
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

		const newReview = new Review<IReview>({
			productId: req.body.productBarcode,
			productName: req.body.productName,
			productBarcode: req.body.productBarcode,
			authorId: req.user._id,
			rating: req.body.rating,
			text: req.body.text || '',
			tags: req.body.tags || [],
			picture: req.body.picture,
			reactions: [],
		});

		newReview
			.save()
			.then((review) => review.populate<{ authorId: ResUser }>('authorId'))
			.then((review) => {
				return res.status(201).json({
					_id: review._id,
					productBarcode: review.productBarcode,
					productName: review.productName,
					author: {
						_id: review.authorId._id,
						displayName: review.authorId.displayName,
						picture: review.authorId.picture,
					},
					rating: review.rating,
					text: review.text,
					tags: review.tags,
					reactions: review.reactions,
					picture: review.picture,
					createdAt: <Date>review.createdAt,
					updatedAt: <Date>review.updatedAt,
				});
			})
			.catch((err) => {
				console.error('error while saving a new review');
				return res.status(500).json({ message: err });
			});
	} catch (err: any) {
		console.error(err);
		return res.status(400).json({ message: err.message });
	}
};

export const getReviewById = async (
	req: Request<{ id: string }>,
	res: Response<APIResponse<ResReview>>
) => {
	try {
		const review = await Review.findById(req.params.id);
		if (!review) {
			return res
				.status(404)
				.json({ message: `There is no review with id ${req.body.id}` });
		}

		review
			.populate<{ authorId: ResUser }>('authorId')
			.then((review) => {
				return res.status(200).json({
					_id: review._id,
					productBarcode: review.productBarcode,
					productName: review.productName,
					author: {
						_id: review.authorId._id,
						displayName: review.authorId.displayName,
						picture: review.authorId.picture,
					},
					rating: review.rating,
					text: review.text,
					tags: review.tags,
					reactions: review.reactions,
					picture: review.picture,
					createdAt: <Date>review.createdAt,
					updatedAt: <Date>review.updatedAt,
				});
			})
			.catch((err) => {
				console.error('Error populating a review document', review._id);
				return res.status(500).json({ message: err });
			});
	} catch (err: any) {
		console.error(err);
		return res.status(400).json({ message: err.message });
	}
};

export const addReactionToReview = async (
	req: Request<{ id: string }, {}, { icon: ReactionIcon }>,
	res: Response<APIResponse<null>>
) => {
	if (!req.user?._id) {
		return res.status(401).json({ message: 'Unauthorized' });
	}
	if (!req.body.icon || !ALLOWED_REACTIONS.includes(req.body.icon)) {
		return res.status(400).json({ message: 'Invalid icon' });
	}

	/* if user has no previous reaction, add one */
	const newReaction = await Review.findOneAndUpdate(
		{ _id: req.params.id, 'reactions.userId': { $ne: req.user._id } },
		{
			$push: {
				reactions: <IReaction>{
					userId: req.user._id,
					icon: req.body.icon,
				},
			},
		}
	).exec();
	if (newReaction) {
		return res.status(201).json({ message: 'Added reaction' });
	}

	/* if user has previous reaction, update it */
	await Review.findOneAndUpdate(
		{ _id: req.params.id },
		{
			$set: {
				'reactions.$[reaction].icon': req.body.icon,
			},
		},
		{ arrayFilters: [{ 'reaction.userId': req.user._id }] }
	)
		.exec()
		.then(() => {
			return res.status(200).json({ message: 'Modified reaction' });
		})
		.catch((err) => {
			console.error(
				`Error modifying an existing reaction for review ${req.params.id}`
			);
			return res.status(500).json({ message: err });
		});
};
