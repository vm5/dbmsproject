import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserCount = () => {
    const [userCount, setUserCount] = useState(null);

    useEffect(() => {
        // Fetch user count from backend
        axios.get('http://localhost:5000/usercount')
            .then(response => {
                setUserCount(response.data.userCount);
            })
            .catch(error => {
                console.error('Error fetching user count:', error);
            });
    }, []);

    return (
        <div>
            <h1>User Count</h1>
            {userCount !== null ? (
                <p>Total Users: {userCount}</p>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default UserCount;
