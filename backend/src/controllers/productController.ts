import type { Request, Response } from 'express';

export const getProductInfo = (
	req: Request<{ barcode: string }>,
	res: Response
) => {
	/*
		1. Check cache for existing data; if nothing is found,
		2. Check database for existing data; if nothing is found,
		3. Check Open Food Facts / go-upc.com for existing data; if nothing is found,
		4. Report to the requester nothing was found (and ask them to enter the information
				using POST /products)
	*/
	res.status(200).json({ x: 2 });
};
