import { Redis } from 'ioredis';
import type { Request, Response, NextFunction } from 'express';

export const redis = new Redis();

export const checkCacheMiddleware =
	(cacheScope: string, keyName: string) =>
	async (req: Request, res: Response, next: NextFunction) => {
		/*
			checkCacheMiddleware returns a middleware that handles
			checking cache for cacheScope:key. If such entry exists
			and it has not expired, the entry is returned.
			otherwise, next() is called and the next handler takes
			care of further actions (db queries etc.)
		*/

		if (process.env?.DISABLE_CACHE) {
			console.warn('Cache is disabled due to environment variable');
			return next();
		}

		// e.g. products:4047443419439
		const key = cacheScope + ':' + req.params[keyName];
		const product = await redis.hgetall(key);
		// if data does not exist go to next middleware
		if (Object.keys(product).length === 0) return next();

		res.status(200).json(product);
	};
