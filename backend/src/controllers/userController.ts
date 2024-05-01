import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { User } from '../models/userModel';

export const register = (req: Request, res: Response) => {
	try {
		const newUser = new User(req.body);
		// hash user password
		const salt = bcrypt.genSaltSync(10);
		newUser.hash_password = bcrypt.hashSync(req.body.password, salt);

		newUser
			.save()
			.then((user) => {
				// do not return the hashed password
				user.hash_password = undefined;
				return res.status(201).send({ message: 'New user registered.' });
			})
			.catch((err) => {
				return res.status(500).send({
					message: err,
				});
			});
	} catch (err: any) {
		console.error(err);
		return res.status(400).send({ message: err.message });
	}
};

export const sign_in = (req: Request, res: Response) => {
	try {
		User.findOne({
			email: req.body.email,
		})
			.exec()
			.then((user) => {
				if (!user || !user.comparePassword(req.body.password))
					return res.status(400).send({ message: 'Invalid user or password.' });

				// generate and return a JWT token
				const token = jwt.sign(
					{ email: user.email, displayName: user.displayName, _id: user._id },
					'ASD'
				);
				return res.json({
					token: token,
				});
			})
			.catch((err) => {
				return res.status(500).send({
					message: err,
				});
			});
	} catch (err: any) {
		console.error(err);
		return res.status(400).send({ message: err.message });
	}
};
