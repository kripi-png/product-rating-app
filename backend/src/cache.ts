import { Redis } from 'ioredis';
import type { Request, Response, NextFunction } from 'express';

export const redis = new Redis();

export const checkCacheMiddleware =
	(cacheScope: string, keyName: string) =>
	async (req: Request, res: Response, next: NextFunction) => {
		/*
		Returns a middleware that handles checking cache for given scope and key.
		Checking cache can be disabled with DISABLE_CACHE env variable
		keyName is used to find the right value from req.params

		For example, checkCacheMiddleware('products', 'barcode') on route /products/:barcode
		returns a function that checks Redis for 'products:<req.params['barcode']>',
		
		If the entry has not expired, data is returned
		Otherwise next() is called to let next handler take care of the request
		
		NOTE: expiring is handled by Redis internally using EXPIRE command
		when caching the data
		More info: https://redis.io/docs/latest/commands/expire/
		
		Roope Sinisalo, 2024
		*/

		if (process.env?.DISABLE_CACHE) {
			console.warn('Cache is disabled with env variable');
			return next();
		}

		// e.g. products:80177173
		const key = cacheScope + ':' + req.params[keyName];
		const product = await redis.hgetall(key);
		// if data does not exist go to next middleware
		if (Object.keys(product).length === 0) return next();

		res.status(200).json(product);
	};


