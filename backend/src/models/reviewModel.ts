import mongoose from 'mongoose';
import type { IReview, IReaction } from '../types';

const Schema = mongoose.Schema;

const ReactionSchema = new Schema<IReaction>(
	{
		icon: {
			type: String,
			required: true,
			trim: true,
		},
		userId: {
			type: Schema.Types.ObjectId,
			ref: 'User',
		},
	},
	{ timestamps: true }
);

const ReviewSchema = new Schema<IReview>(
	{
		productId: {
			type: String,
			ref: 'Product',
			required: true,
		},
		productName: {
			type: String,
			required: true,
			trim: true,
		},
		productBarcode: {
			type: String,
			required: true,
			trim: true,
		},

		authorId: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		rating: {
			type: Schema.Types.Decimal128,
			required: true,
			min: 0.1,
			max: 5.0,
			set: (v: string | number) =>
				new mongoose.Types.Decimal128(String(v).substring(0, 3)), // strip instead of round; 4.999 -> 4.9 instead of 5
		},

		picture: {
			type: String,
			trim: true,
		},
		text: {
			type: String,
			trim: true,
		},
		tags: [
			{
				type: String,
				trim: true,
			},
		],
		reactions: [ReactionSchema],
	},
	{ timestamps: true }
);

export const Review = mongoose.model<IReview>('Review', ReviewSchema);

// const review = new Review({
// 	productId: '6633f264b036dad54cece765',
// 	productName: 'test',
// 	productBarcode: '1235',
// 	authorId: '663103544a4b90d30ad301f0',
// 	rating: 4.999999,
// });
// review
// 	.save()
// 	.then((review) => console.log(review))
// 	.catch((err) => console.error(err));

// Review.findOne({
// 	_id: review._id,
// })
// 	.populate('authorId')
// 	.then((found) => {
// 		console.log(found);
// 	})
// 	.catch((err) => console.error(err));
