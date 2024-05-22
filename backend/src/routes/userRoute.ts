import type { Application, Request } from 'express';
import * as authController from '../controllers/authController';
import * as userController from '../controllers/userController';

export default (app: Application) => {
	app.route('/auth/register').post(authController.register);
	app.route('/auth/sign_in').post(authController.sign_in);
	app.route('/auth/test').get(authController.loginRequired, (_req, res) => {
		res.send('yoda hopped in his honda');
	});
	// /user/me for convenience. Redirects to respective /user/:userId
	app
		.route('/user/me/*')
		.get(authController.loginRequired, (req: Request<any>, res) => {
			res.redirect(`/user/${req.user?._id}/${req.params[0]}`);
		});
	app
		.route('/user/:userId/reviews')
		.get(authController.loginRequired, userController.getReviewsByUser);
};
