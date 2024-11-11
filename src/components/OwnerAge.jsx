import React, { useState, useEffect } from 'react';

function AverageOwnerAge() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/averageownerage') // Update with your backend URL
      .then(response => response.json())
      .then(data => setData(data))
      .catch(error => console.error("Fetch error:", error));
  }, []);

  return (
    <div>
      <h2>Average Age of Owners by Agreement Status</h2>
      {data.length > 0 ? (
        <ul>
          {data.map((item, index) => (
            <li key={index}>
              Agreement Status: {item.aggrement_status}, 
              Average Age: {isNaN(item.average_age) ? 'N/A' : parseFloat(item.average_age).toFixed(2)}
            </li>
          ))}
        </ul>
      ) : (
        <p>No data available.</p>
      )}
    </div>
  );
}

export default AverageOwnerAge;
