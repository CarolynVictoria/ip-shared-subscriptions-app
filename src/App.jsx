import React, { useEffect, useState } from 'react';
import Header from './components/Header';
import MainContent from './components/MainContent';

const App = () => {
	const [refreshKey, setRefreshKey] = useState(0);

	// Add the API test code here
	useEffect(() => {
		// Test the proxy by calling /api/test
		fetch('/api/test')
			.then((res) => res.json())
			.then((data) => console.log('Proxy test response:', data))
			.catch((error) => console.error('Proxy test error:', error));
	}, []); // Run only once when the component mounts

	const handleRefresh = async () => {
		try {
			const response = await fetch('/api/refresh-subscriptions', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
			});
			if (response.ok) {
				alert('Data refreshed successfully!');
				setRefreshKey((prev) => prev + 1); // Increment refreshKey
			} else {
				alert('Failed to refresh data. Please try again.');
			}
		} catch (error) {
			console.error('Error refreshing data:', error);
			alert('An error occurred. Please check the console for details.');
		}
	};

	return (
		<div className='App'>
			<Header onRefresh={handleRefresh} />
			<MainContent refreshKey={refreshKey} />
		</div>
	);
};

export default App;