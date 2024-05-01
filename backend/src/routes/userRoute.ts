import type { Application } from 'express';
import * as authController from '../controllers/authController';

export default (app: Application) => {
	app.route('/auth/register').post(authController.register);
	app.route('/auth/sign_in').post(authController.sign_in);
	app.route('/profile').get(authController.loginRequired, (_req, res) => {
		res.send('hallo');
	});
};
