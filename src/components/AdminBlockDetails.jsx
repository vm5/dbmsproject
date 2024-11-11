import React, { useEffect, useState } from "react";

function AdminBlockDetails() {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Fetch data from the server when the component mounts
    fetch("http://localhost:5000/adminblockdetails")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => setData(data))
      .catch((error) => console.error("Fetch error:", error));
  }, []);

  return (
    <div>
      <h1>Admin Block Details</h1>
      <ul>
        {data.map((item, index) => (
          <li key={index}>
            Admin Name: {item.admin_name}, Block Name: {item.block_name}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AdminBlockDetails;
