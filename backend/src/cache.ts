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

		// e.g. products:4047443419439
		const key = cacheScope + ':' + req.params[keyName];
		const isCached = await redis.hexists(key, 'barcode');
		if (!isCached) return next();

		const expiresDateStr = await redis.hget(key, 'expires');
		const expires = new Date(<string>expiresDateStr);
		// if date is invalid or has been passed,
		if (!expires || isNaN(<any>expires) || new Date() >= expires) {
			redis.del(key); // delete expired entry
			return next();
		}

		// if cache exists and is valid, simply return its values
		res.status(200).json(await redis.hgetall(key));
	};
