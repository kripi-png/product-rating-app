import mongoose from 'mongoose';

import type { IProduct } from '../types';

const Schema = mongoose.Schema;

const ProductSchema = new Schema<IProduct>({
	barcode: {
		type: String,
		required: true,
	},
	name: {
		type: String,
		required: true,
	},
	avgRating: {
		type: Number,
		default: 0.0,
	},
	created: {
		type: Date,
		default: Date.now,
	},
});

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
