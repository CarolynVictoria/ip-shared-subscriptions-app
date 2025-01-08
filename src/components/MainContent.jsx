import React, { useEffect, useState } from 'react';
import { fetchSharedSubscriptions } from '../services/api';

const MainContent = ({ refreshKey }) => {
	const [subscriptions, setSubscriptions] = useState([]);

	useEffect(() => {
		const loadSubscriptions = async () => {
			try {
				const data = await fetchSharedSubscriptions();
				setSubscriptions(data);
			} catch (error) {
				console.error('Error loading shared subscriptions:', error);
			}
		};

		loadSubscriptions();
	}, [refreshKey]); // Re-run effect whenever refreshKey changes

	return (
		<div className='p-4'>
			<h1 className='text-2xl font-bold mb-4'>Shared Subscriptions</h1>
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
				{subscriptions.map((sub) => (
					<div key={sub._id} className='p-4 border rounded shadow-sm'>
						<h2 className='text-lg font-semibold'>{sub.subscription_id}</h2>
						<p>Total Tokens: {sub.total_tokens}</p>
						<p>Unused Tokens: {sub.unused_tokens}</p>
						<p>Redeemed Tokens: {sub.redeemed_tokens}</p>
						<h3 className='mt-2 font-medium'>Shared Accounts:</h3>
						<ul className='list-disc pl-4'>
							{sub.shared_accounts?.map((account, index) => (
								<li
									key={account.account_id || `${sub.subscription_id}-${index}`}
								>
									<p>{account.email}</p>
									<p>{account.personal_name || ''}</p>
								</li>
							)) || <li></li>}
						</ul>
					</div>
				))}
			</div>
		</div>
	);
};

export default MainContent;
