import mongoose from 'mongoose';

import type { IProduct } from '../types';

const Schema = mongoose.Schema;

const ProductSchema = new Schema<IProduct>(
	{
		barcode: {
			type: String,
			required: true,
			trim: true,
		},
		name: {
			type: String,
			required: true,
			trim: true,
		},
		avgRating: {
			type: Number,
			default: 0.0,
		},
	},
	{ timestamps: true }
);

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
