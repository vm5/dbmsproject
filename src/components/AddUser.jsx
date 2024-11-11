import React, { useState } from 'react';

const AddUser = () => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [responseMessage, setResponseMessage] = useState('');
  const [latestLog, setLatestLog] = useState(null);

  const handleAddUser = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/adduser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, password }),
      });

      if (!response.ok) {
        throw new Error('Failed to add user');
      }

      const data = await response.json();
      setResponseMessage(data.message || 'User added successfully');
      setLatestLog(data.log); // Store the log entry in state
    } catch (error) {
      setResponseMessage(`Error: ${error.message}`);
    }
  };

  return (
    <div>
      <h2>Add User</h2>
      <form onSubmit={handleAddUser}>
        <div>
          <label>User ID:</label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Add User</button>
      </form>
      {responseMessage && <p>{responseMessage}</p>}

      {/* Display the latest log entry */}
      {latestLog && (
        <div>
          <h3>Latest Log Entry</h3>
          <p><strong>Log ID:</strong> {latestLog.log_id}</p>
          <p><strong>User ID:</strong> {latestLog.user_id}</p>
          <p><strong>Action:</strong> {latestLog.action}</p>
          <p><strong>Timestamp:</strong> {latestLog.timestamp}</p>
        </div>
      )}
    </div>
  );
};

export default AddUser;
