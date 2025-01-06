import axios from 'axios';
import { MongoClient } from 'mongodb';

// MongoDB URI and database/collection names
const mongoUri = process.env.MONGO_URI; // Set in .env file
const dbName = process.env.MONGO_DB_NAME || 'ip_shared_subscriptions';
const rawCollection = 'raw';
const formattedCollection = 'formatted';

// Controller function
export const refreshSharedSubscriptions = async (req, res) => {
	const client = new MongoClient(mongoUri);
	try {
		// 1. Fetch data from the Piano.io API using axios
		const pianoResponse = await axios.get(
			'https://api.piano.io/your-endpoint',
			{
				headers: {
					Authorization: `Bearer ${process.env.PIANO_API_TOKEN}`,
					'Content-Type': 'application/json',
				},
			}
		);

		// Axios automatically parses the response as JSON
		const data = pianoResponse.data;

		// 2. Insert data into the "raw" collection
		await client.connect();
		const db = client.db(dbName);
		const raw = db.collection(rawCollection);

		// Overwrite the "raw" collection
		await raw.deleteMany({});
		await raw.insertMany(data.subscriptions); // Assume the API returns an array of subscriptions

		// 3. Run the aggregation pipeline
		const formatted = db.collection(formattedCollection);

		const pipeline = [
			{
				$group: {
					_id: '$subscription_id',
					total_tokens: { $sum: '$tokens' },
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

		// Overwrite the "formatted" collection
		await formatted.deleteMany({});
		await formatted.insertMany(await raw.aggregate(pipeline).toArray());

		// 4. Respond with success
		res
			.status(200)
			.json({ message: 'Shared subscription data refreshed successfully!' });
	} catch (error) {
		console.error('Error refreshing shared subscription data:', error);
		res
			.status(500)
			.json({ message: 'An error occurred while refreshing data.' });
	} finally {
		await client.close();
	}
};
