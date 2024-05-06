import type { Types } from 'mongoose';

export type APIResponse<T> = T | { message: string };

/* PRODUCT types */
export interface IProduct {
	_id: string;
	name: string;
	barcode?: string; // barcode is an alias for _id
	avgRating?: number;
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

/* REVIEW types */
export interface IReaction {
	icon: string;
	userId: Types.ObjectId;
	createdAt?: Date;
	updatedAt?: Date;
}

export interface IReview {
	productId: string;
	productName: string;
	productBarcode: string;
	authorId: Types.ObjectId;
	rating: number;
	text: string;
	tags: string[];
	reactions: IReaction[];
	picture?: string;
	createdAt?: Date;
	updatedAt?: Date;
}

export interface ResReview {
	_id: Types.ObjectId;
	productBarcode: string;
	productName: string;
	author: ResUser;
	rating: number;
	text: string;
	tags: string[];
	reactions: IReaction[];
	picture?: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface ReqReview {
	productBarcode: string;
	productName: string;
	rating: number;
	picture?: string;
	text?: string;
	tags?: string[];
}

/* USER types */
export interface IUser {
	displayName: string;
	email: string;
	hash_password: string;
	picture?: string;
	createdAt?: Date;
	updatedAt?: Date;
	// schema methods
	comparePassword: (password: string) => {};
}

// type of data inside JWT tokens
export interface IJWTUser {
	_id: Types.ObjectId;
	email: string;
	displayName: string;
	pictureUrl?: string;
}

export interface ResUser {
	_id: string;
	displayName: string;
	picture?: string;
}
