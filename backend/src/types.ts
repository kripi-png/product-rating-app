import type { Types } from 'mongoose';

export type APIResponse<T> = T | { message: string };

export interface ResProduct {
	barcode: string;
	name: string;
	avgRating: number;
	createdAt: Date;
	updatedAt: Date;
}

/* REVIEW types */
export type ReactionIcon = '👍' | '❤️' | '✨';

export interface ResReview {
	_id: Types.ObjectId;
	productBarcode: string;
	productName: string;
	author: ResUser;
	rating: number;
	text: string;
	tags: string[];
	reactions: {
		counts: { [key: string]: number };
		selfReaction?: ReactionIcon;
	};
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

// type of data inside JWT tokens
export interface IJWTUser {
	_id: string;
	email: string;
	displayName: string;
	pictureUrl?: string;
}

export interface ResUser {
	_id: string;
	displayName: string;
	picture?: string;
}
