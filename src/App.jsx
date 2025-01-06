import React from 'react';
import Header from './components/Header';
import MainContent from './components/MainContent';

const App = () => {
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
			<MainContent />
		</div>
	);
};

export default App;
