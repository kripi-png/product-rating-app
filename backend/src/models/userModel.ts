import mongoose, { Schema } from 'mongoose';
import type { UserDocument, UserModel, UserSchema } from '../interfaces/mongoose.gen';
import bcrypt from 'bcrypt';

const UserSchema: UserSchema = new Schema(
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
			required: true,
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

export const User = mongoose.model<UserDocument, UserModel>('User', UserSchema);
