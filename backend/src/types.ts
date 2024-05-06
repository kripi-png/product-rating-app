import type { Types } from 'mongoose';
export interface IUser {
	displayName: string;
	email: string;
	hash_password?: string;
	comparePassword: (password: string) => {};
	createdAt?: Date;
	updatedAt?: Date;
}

// type of data inside JWT tokens
export interface IJWTUser {
	_id: Types.ObjectId;
	email: string;
	displayName: string;
}

export interface IReaction {
	icon: string;
	userId: Types.ObjectId;
	createdAt?: Date;
	updatedAt?: Date;
}

export interface IReview {
	productId: String;
	productName: string;
	productBarcode: string;
	authorId: Types.ObjectId;
	picture?: string;
	rating: Types.Decimal128 | number;
	text: string;
	tags: string[];
	reactions: IReaction[];
	createdAt?: Date;
	updatedAt?: Date;
}

/* reworked types */
export type APIResponse<T> = T | { message: string };

/* PRODUCT types */
export interface IProduct {
	_id: string;
	name: string;
	barcode?: string; // barcode is an alias for _id
	avgRating?: Types.Decimal128 | number;
	createdAt?: Date;
	updatedAt?: Date;
}

export interface ResProduct {
	barcode: string;
	name: string;
	avgRating: number;
	createdAt: Date;
	updatedAt: Date;
}
