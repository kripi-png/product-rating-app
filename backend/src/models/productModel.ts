import type { IProduct } from '../types';

import mongoose from 'mongoose';
import { validate as validateBarcode } from '../utils/barcodeValidator';

const Schema = mongoose.Schema;

const ProductSchema = new Schema<IProduct>(
	{
		_id: {
			type: String,
			trim: true,
			required: true,
			alias: 'barcode',
			validate: {
				validator: (v: string) => validateBarcode(v),
				message: (props) => `${props.value} is not a valid barcode`,
			},
		},
		name: {
			type: String,
			required: true,
			trim: true,
		},
		avgRating: {
			type: Number,
			min: 1.0,
			max: 5.0,
			default: null,
		},
	},
	{ timestamps: true }
);

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
