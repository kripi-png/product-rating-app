import type { Request, Response } from 'express';
import type {
	APIResponse,
	ReactionIcon,
	ReqReview,
	ResReview,
	ResUser,
} from '../types';

import { Review } from '../models/reviewModel';
import { Product } from '../models/productModel';

// define list of allowed reactions for checking icon using .includes()
// also init an object of icon-count to be used as the initial value for .reduce():s
const ALLOWED_REACTIONS: ReactionIcon[] = ['👍', '❤️', '✨'];
const initialReactionCounts = ALLOWED_REACTIONS.reduce<{
	[key: string]: number;
}>((acc, icon) => {
	acc[icon] = 0;
	return acc;
}, {});

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

		const newReview = new Review({
			productId: req.body.productBarcode,
			productName: req.body.productName,
			productBarcode: req.body.productBarcode,
			authorId: Object(req.user._id),
			rating: req.body.rating,
			text: req.body.text,
			tags: req.body.tags,
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
					reactions: {
						counts: initialReactionCounts,
						selfReaction: undefined,
					},
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
	req: Request<{ id: string }, {}, {}>,
	res: Response<APIResponse<ResReview>>
) => {
	/*
		Return review data by id.
		authorId field contains review's author's display name and id
		reactions contains an object of icons and their counts as well
		as selfReaction for current user's reaction (which is included in the total count)
	*/
	try {
		const review = await Review.findById(req.params.id);
		if (!review) {
			return res
				.status(404)
				.json({ message: `There is no review with id ${req.params.id}` });
		}

		review
			.populate<{ authorId: ResUser }>('authorId')
			.then((review) => {
				const reviewByUser = review.reactions.find(
					(r) => r.userId.toString() === req.user?._id
				);
				const reactionCounts = review.reactions.reduce<{
					[key: string]: number;
				}>(
					(acc, reaction) => {
						acc[reaction.icon] += 1;
						return acc;
					},
					{ ...initialReactionCounts } // create copy of the initial obj to not edit that
				);

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
					reactions: {
						counts: reactionCounts,
						selfReaction: reviewByUser?.icon,
					},
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

type ReqReaction =
	| {
			action: 'ADD' | 'CHANGE';
			icon: ReactionIcon;
	  }
	| {
			action: 'REMOVE';
	  };

export const addReactionToReview = async (
	req: Request<{ id: string }, {}, ReqReaction>,
	res: Response<APIResponse<null>>
) => {
	if (!req.user?._id) {
		return res.status(401).json({ message: 'Unauthorized' });
	}
	if (!['ADD', 'CHANGE', 'REMOVE'].includes(req.body.action)) {
		return res
			.status(400)
			.json({ message: 'Invalid action. Use either ADD, CHANGE, or REMOVE' });
	}
	if (
		!req.body.action ||
		(req.body.action !== 'REMOVE' &&
			(!req.body.icon || !ALLOWED_REACTIONS.includes(req.body.icon)))
	) {
		return res.status(400).json({ message: 'Invalid request body' });
	}

	switch (req.body.action) {
		case 'ADD':
			const newReview = await Review.findOneAndUpdate(
				{ _id: req.params.id, 'reactions.userId': { $ne: req.user._id } },
				{
					$push: {
						reactions: {
							userId: Object(req.user._id),
							icon: req.body.icon,
						},
					},
				}
			)
				.exec()
				.catch((err) => {
					console.error(
						`Error adding reaction ${(req.body as { icon: ReactionIcon }).icon} to review ${req.params.id}: ${err}`
					);
					return null;
				});
			if (!newReview) {
				return res
					.status(500)
					.json({ message: 'Review already has a reaction by the user' });
			}
			return res.status(201).json({ message: 'Reaction added' });

		case 'CHANGE':
			const updateReview = await Review.findOneAndUpdate(
				{ _id: req.params.id, 'reactions.userId': req.user._id },
				{
					$set: {
						'reactions.$[reaction].icon': req.body.icon,
					},
				},
				{ arrayFilters: [{ 'reaction.userId': req.user._id }] }
			)
				.exec()
				.catch((err) => {
					req.body;
					console.error(
						`Error changing reaction by user ${req.user?._id} on review ${req.params.id}: ${err}`
					);
					return null;
				});
			if (!updateReview) {
				return res.status(500).json({ message: 'Failed to change reaction' });
			}
			return res.status(200).json({ message: 'Changed reaction successfully' });

		case 'REMOVE':
			const removeReview = await Review.findOneAndUpdate(
				{ _id: req.params.id, 'reactions.userId': req.user._id },
				{
					$pull: {
						reactions: { userId: req.user._id },
					},
				}
			)
				.exec()
				.catch((err) => {
					console.error(
						`Error removing reaction by user ${req.user?._id} from review ${req.params.id}: ${err}`
					);
					return null;
				});
			if (!removeReview) {
				return res.status(500).json({ message: 'Error removing reaction' });
			}
			return res.status(200).json({ message: 'Removed reaction successfully' });

		default:
			return res
				.status(418)
				.json({ message: "Don't know how this was possible?" });
	}
};

export const editReview = async (
	req: Request<{ id: string }, {}, ReqReview>,
	res: Response<APIResponse<ResReview>>
) => {
	const editedReview = await Review.findOneAndUpdate(
		{ _id: req.params.id },
		{
			productBarcode: req.body.productBarcode,
			productName: req.body.productName,
			rating: req.body.rating,
			picture: req.body.picture,
			text: req.body.text,
			tags: req.body.tags,
		},
		{ new: true }
	)
		.exec()
		.catch((err) => {
			console.error(err);
			return null;
		});

	if (!editedReview) {
		return res.status(500).json({ message: 'Error editing review' });
	}
	return res.status(200).json({ message: 'Review edited successfully' });
};

export const removeReview = async (
	req: Request<{ id: string }, {}, {}>,
	res: Response<APIResponse<null>>
) => {};
