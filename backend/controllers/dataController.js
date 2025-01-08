import dotenv from 'dotenv';
dotenv.config();

import { MongoClient } from 'mongodb';
import { fetchSharedSubscriptions } from '../services/pianoApi.js';

console.log('process.env in dataController.js:', process.env);
console.log('MONGO_URI in dataController:', process.env.MONGO_URI);

const mongoUri = process.env.MONGO_URI;
const dbName = process.env.MONGO_DB_NAME || 'IPSharedSubscription';

if (!dbName) {
	throw new Error(
		'MONGO_DB_NAME environment variable is not set. Please define it in your .env file.'
	);
}

export const refreshSharedSubscriptions = async (req, res) => {
	console.log('Starting refreshSharedSubscriptions...');
	console.log('MONGO_URI:', mongoUri);
	console.log('Target Database Name:', dbName);

	const client = new MongoClient(mongoUri);

	try {
		// Fetch data from Piano.io API
		console.log('Fetching data from Piano.io API...');
		const data = await fetchSharedSubscriptions();
		console.log(
			`Fetched ${data?.SharedSubscriptions?.length || 0} subscriptions`
		);

		// Connect to MongoDB
		console.log('Connecting to MongoDB...');
		await client.connect();
		console.log('Connected to MongoDB successfully');

		// Select the database and collections
		const db = client.db(dbName);
		const rawCollection = db.collection('shared_subscriptions_raw');
		const appCollection = db.collection('shared_subscriptions_app');

		// Insert data into `shared_subscriptions_raw` collection
		console.log('Inserting data into "shared_subscriptions_raw" collection...');
		await rawCollection.deleteMany({});
		await rawCollection.insertMany(data.SharedSubscriptions || []);
		console.log(
			'Data inserted into "shared_subscriptions_raw" collection successfully'
		);

		// Run aggregation pipeline and flatten `shared_accounts` field
		console.log('Running aggregation pipeline...');
		const pipeline = [
			{
				$unwind: {
					path: '$shared_accounts',
					preserveNullAndEmptyArrays: true,
				},
			},
			{
				$unwind: {
					path: '$shared_accounts',
					preserveNullAndEmptyArrays: true,
				},
			},
			{
				$group: {
					_id: '$subscription_id',
					total_tokens: { $sum: '$total_tokens' },
					unused_tokens: { $sum: '$unused_tokens' },
					redeemed_tokens: { $sum: '$redeemed_tokens' },
					shared_accounts: { $push: '$shared_accounts' },
				},
			},
			{
				$project: {
					_id: 0,
					subscription_id: '$_id',
					total_tokens: 1,
					unused_tokens: 1,
					redeemed_tokens: 1,
					shared_accounts: 1,
				},
			},
		];

		// Store aggregation result in formattedData
		const formattedData = await rawCollection.aggregate(pipeline).toArray();

		// Overwrite data in `shared_subscriptions_app` collection
		await appCollection.deleteMany({});
		await appCollection.insertMany(formattedData);
		console.log('Aggregation pipeline completed successfully');

		// Ensure the data sent to the frontend includes the shared_accounts field
		console.log('API Response Data:', JSON.stringify(formattedData, null, 2));

		// Send response
		res.status(200).json({
			message: 'Shared subscription data refreshed successfully!',
			data: formattedData,
		});
	} catch (error) {
		// Handle errors
		console.error('Error refreshing shared subscription data:', error.message);
		console.error('Stack Trace:', error.stack);
		res.status(500).json({
			message: 'An error occurred while refreshing data.',
		});
	} finally {
		console.log('Closing MongoDB connection...');
		await client.close();
		console.log('MongoDB connection closed');
	}
};

console.log('MONGO_URI in dataController:', process.env.MONGO_URI);
console.log('process.env in dataController.js:', process.env);
