import type { Types } from 'mongoose';
export interface IUser {
	displayName: string;
	email: string;
	hash_password?: string;
	created: Date;
	comparePassword: (password: string) => {};
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
	avgRating?: number;
	created?: Date;
}
