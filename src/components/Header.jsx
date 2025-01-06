import React from 'react';

const Header = ({ onRefresh }) => {
	return (
		<header className='flex justify-between items-center p-4 bg-gray-800 text-white'>
			<h1 className='text-xl font-bold'>IP Shared Subscriptions Dashboard</h1>
			<button
				onClick={onRefresh}
				className='px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded text-white'
			>
				Refresh Subscription Data
			</button>
		</header>
	);
};

export default Header;
