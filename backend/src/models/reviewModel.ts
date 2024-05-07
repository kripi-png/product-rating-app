import mongoose from 'mongoose';
import type { IReview, IReaction } from '../types';

const Schema = mongoose.Schema;

const ReactionSchema = new Schema<IReaction>(
	{
		icon: {
			type: String,
			enum: ['👍', '❤️', '✨'],
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
			type: Number,
			required: true,
			min: 0.1,
			max: 5.0,
			validate: {
				validator: (v: any) => v.toString().length <= 3, // disable ratings with more than 1 decimal places
				message: (props) => `Invalid rating: ${props.value}`,
			},
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
