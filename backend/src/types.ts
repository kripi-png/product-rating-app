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

export interface IProduct {
	barcode: string;
	name: string;
	avgRating?: number | string;
	createdAt?: Date;
	updatedAt?: Date;
}

export interface IReaction {
	icon: string;
	userId: Types.ObjectId;
	createdAt?: Date;
	updatedAt?: Date;
}

export interface IReview {
	productId: Types.ObjectId;
	productName: string;
	productBarcode: string;
	authorId: Types.ObjectId;
	picture?: string;
	rating: Types.Decimal128;
	text: string;
	tags: string[];
	reactions: IReaction[];
	createdAt?: Date;
	updatedAt?: Date;
}
