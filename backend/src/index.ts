import express from 'express';
import './db'; // include and init db without *really* importing anything

import userRoute from './routes/userRoute';

const app = express();
app.use(express.json());
app.use(
	express.urlencoded({
		extended: true,
	})
);

app.get('/', (_req, res) => {
	res.send('Hello World');
});

userRoute(app);

app.listen(3000, () => {
	console.log('Server online and listening on port 3000');
});
