import mongoose from 'mongoose';

mongoose.connect(process.env.DATABASE_URL as string, {
	useNewUrlParser: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error'));
db.on('open', () => {
	console.log('MongoDB successfully connected');
});

// Load models at startup.
import './models';

export default db;
