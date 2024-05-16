import type { Request, Response, NextFunction } from 'express';
import type { APIResponse, IJWTUser } from '../types';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { User } from '../models/userModel';

export const register = (
	req: Request<
		{},
		{},
		{ displayName: string; email: string; password: string }
	>,
	res: Response<APIResponse<null>>
) => {
	try {
		const newUser = new User(req.body);
		// hash user password
		const salt = bcrypt.genSaltSync(10);
		newUser.hash_password = bcrypt.hashSync(req.body.password, salt);

		newUser
			.save()
			.then(() => {
				// do not return the hashed password
				return res.status(201).json({ message: 'New user registered.' });
			})
			.catch((err: any) => {
				return res.status(500).json({
					message: err,
				});
			});
	} catch (err: any) {
		console.error(err);
		return res.status(400).json({ message: err.message });
	}
};

export const sign_in = (
	req: Request<{}, {}, { email: string; password: string }>,
	res: Response<APIResponse<{ token: string }>>
) => {
	try {
		if (!process.env.JWT_SECRET) {
			throw Error('Missing environment variable');
		}

		User.findOne(
			{ email: req.body.email },
			{ email: true, hash_password: true, displayName: true } // explicitly get email and password which are exluded by default
		)
			.exec()
			.then((user) => {
				if (!user || !user.comparePassword(req.body.password))
					return res.status(400).json({ message: 'Invalid user or password.' });

				// generate and return a JWT token
				const token = jwt.sign(
					<IJWTUser>{
						email: user.email,
						displayName: user.displayName,
						pictureUrl: user.picture,
						_id: user._id as unknown as string,
					},
					process.env.JWT_SECRET as string
				);
				return res.json({
					token: token,
				});
			})
			.catch((err) => {
				return res.status(500).json({
					message: err,
				});
			});
	} catch (err: any) {
		console.error(err);
		return res.status(400).json({ message: err.message });
	}
};

export function loginRequired(
	req: Request,
	res: Response<APIResponse<null>>,
	next: NextFunction
) {
	/* a simple middleware for checking if request has JWT-token / user data */
	if (req.user) {
		next();
	} else {
		return res.status(401).json({ message: 'Unauthorized!' });
	}
}
