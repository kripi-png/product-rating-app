import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

import type { IUser } from '../types';

const Schema = mongoose.Schema;

const UserSchema = new Schema<IUser>({
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
	},
	hash_password: {
		type: String,
	},
	created: {
		type: Date,
		default: Date.now,
	},
});

UserSchema.methods.comparePassword = function (password: string) {
	return bcrypt.compareSync(password, this.hash_password);
};

export const User = mongoose.model<IUser>('User', UserSchema);
