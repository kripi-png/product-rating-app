import type { Application } from 'express';
import { loginRequired } from '../controllers/authController';
import * as reviewController from '../controllers/reviewController';

// import { checkCacheMiddleware as checkCache } from '../cache';

export default (app: Application) => {
	app.route('/reviews').post(loginRequired, reviewController.postReview);
	app
		.route('/reviews/:id')
		.get(loginRequired, reviewController.getReviewById)
		.put(loginRequired, reviewController.editReview)
		.delete(loginRequired, reviewController.removeReview);
	app
		.route('/reviews/:id/reaction')
		.post(loginRequired, reviewController.addReactionToReview);
};
