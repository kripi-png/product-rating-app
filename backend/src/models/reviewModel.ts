import mongoose, { Schema } from 'mongoose';

import type { ReviewDocument, ReviewModel, ReviewSchema } from '../interfaces/mongoose.gen';


const ReactionSchema = new Schema(
	{
		icon: {
			type: String,
			enum: ['👍', '❤️', '✨'],
			required: true,
			trim: true,
		},
		userId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'User',
		},
	},
	{ timestamps: true }
);

const ReviewSchema: ReviewSchema = new Schema(
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
			required: true,
			default: "",
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

export const Review = mongoose.model<ReviewDocument, ReviewModel>('Review', ReviewSchema);
