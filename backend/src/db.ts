import mongoose from 'mongoose';

mongoose.connect('mongodb://localhost:27017/arvosteludb');

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
	console.log('Database connected successfully');
});

export { db };
