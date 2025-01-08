import axios from 'axios';
import qs from 'qs';

export const fetchSharedSubscriptions = async () => {
	try {
		// Prepare request payload
		const data = qs.stringify({
			aid: process.env.PIANO_API_AID, // From .env
			api_token: process.env.PIANO_API_TOKEN, // From .env
			limit: '50000',
			offset: '0',
		});

		// Configure Axios request
		const config = {
			method: 'post', // Change to POST if required
			maxBodyLength: Infinity,
			url: `${process.env.PIANO_API_URL}/publisher/subscription/share/list`, // From .env
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				Accept: 'application/json',
			},
			data: data,
		};

		// Perform API call
		const response = await axios.request(config);
		return response.data;
	} catch (error) {
		console.error('Error fetching shared subscriptions:', error);
		throw error; // Propagate error for handling upstream
	}
};
