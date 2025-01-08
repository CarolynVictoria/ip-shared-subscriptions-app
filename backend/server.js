import dotenv from 'dotenv';
dotenv.config();
import path from 'path';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import { refreshSharedSubscriptions } from './controllers/dataController.js';

// Define __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file
//dotenv.config({ path: path.resolve(__dirname, '../.env') });

console.log('Resolved .env path:', path.resolve(__dirname, '../.env'));
console.log('Loaded environment variables:', process.env);

const MONGO_URI = process.env.MONGO_URI;
const app = express();
const PORT = process.env.BACKEND_PORT || 5555;

// Ensure MONGO_URI is defined
if (!MONGO_URI) {
	console.error('MONGO_URI is not defined. Please check your .env file.');
	process.exit(1);
}

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose
	.connect(MONGO_URI)
	.then(() => console.log('MongoDB connection established successfully'))
	.catch((error) => console.error('MongoDB connection error:', error.message));

// Mongoose Schema and Model (if needed for /api/shared-subscriptions)
const sharedSubscriptionSchema = new mongoose.Schema(
	{
		subscription_id: String,
		term_id: String,
		uid: String,
		total_tokens: Number,
		unused_tokens: Number,
		redeemed_tokens: Number,
		shared_accounts: [
			{
				account_id: String,
				user_id: String,
				email: String,
				first_name: String,
				last_name: String,
				personal_name: String,
				active: Boolean,
				redeemed: Number,
			},
		],
	},
	{ collection: 'shared_subscriptions_app' } // Explicitly specify the collection name
);

const SharedSubscription = mongoose.model(
	'SharedSubscription',
	sharedSubscriptionSchema
);

// Get Shared Subscriptions
app.get('/api/shared-subscriptions', async (req, res) => {
	try {
		const sharedSubscriptions = await SharedSubscription.find();
		res.json(sharedSubscriptions);
	} catch (error) {
		console.error('Error fetching shared subscriptions:', error.message);
		res.status(500).json({ error: error.message });
	}
});

// Refresh Shared Subscriptions Route
app.post('/api/refresh-subscriptions', refreshSharedSubscriptions);

// Test route
app.get('/api/test', (req, res) => {
	console.log('Test route hit');
	res.json({ message: 'Proxy is working!' });
});

console.log('Backend server is ready to receive requests');

// Start server
app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});
