import axios from 'axios';

console.log('HELLO - fetchSharedSubscriptions file is loaded');

const API_URL = 'http://localhost:5555/api/shared-subscriptions';

export const fetchSharedSubscriptions = async () => {
	try {
		const response = await axios.get(API_URL);
		return response.data;
	} catch (error) {
		console.error('Error fetching shared subscriptions:', error);
		throw error;
	}
};
