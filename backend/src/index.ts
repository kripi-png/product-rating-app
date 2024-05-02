import type { IJWTUser } from './types';
import dotenv from "dotenv";
dotenv.config();
import express from 'express';
import jsonwebtoken from 'jsonwebtoken';
import './db'; // include and init db without *really* importing anything

// some extension magic to allow user prop inside requests
declare module 'express-serve-static-core' {
	interface Request {
		user: IJWTUser | undefined;
	}
}

import userRoute from './routes/userRoute';

const app = express();
app.use(express.json());
app.use(
	express.urlencoded({
		extended: true,
	})
);

app.use((req, _res, next) => {
	if (
		req.headers &&
		req.headers.authorization &&
		req.headers.authorization.split(' ')[0] === 'Bearer'
	) {
		jsonwebtoken.verify(
			req.headers.authorization.split(' ')[1],
			<string>process.env.JWT_SECRET,
			(err, decode) => {
				if (err) req.user = undefined;
				req.user = <IJWTUser>decode; // cast decoded data
				next();
			}
		);
	} else {
		req.user = undefined;
		next();
	}
});

app.get('/', (_req, res) => {
	res.send('Hello World');
});

userRoute(app);

app.listen(3000, () => {
	console.log('Server online and listening on port 3000');
});
