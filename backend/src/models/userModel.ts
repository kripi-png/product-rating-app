import type { IUser } from '../types';

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const Schema = mongoose.Schema;

const UserSchema = new Schema<IUser>(
	{
		displayName: {
			type: String,
			trim: true,
			required: true,
		},
		email: {
			type: String,
			unique: true,
			lowercase: true,
			trim: true,
			required: true,
			select: false,
		},
		hash_password: {
			type: String,
			requred: true,
			select: false,
		},
		picture: {
			type: String,
		},
	},
	{ timestamps: true }
);

UserSchema.methods.comparePassword = function (password: string) {
	return bcrypt.compareSync(password, this.hash_password);
};

export const User = mongoose.model<IUser>('User', UserSchema);
