import React, { useState, useEffect } from 'react';

function EmployeeSupervisors() {
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/employeesupervisors') // Corrected endpoint URL
      .then(response => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then(data => setEmployees(data))
      .catch(error => console.error("Fetch error:", error));
  }, []);

  return (
    <div>
      <h2>Employees and Supervisors</h2>
      {employees.length > 0 ? (
        <ul>
          {employees.map((emp) => (
            <li key={emp.emp_id}>
              Employee: {emp.employee_name}, Supervisor: {emp.supervisor_name || "None"}, 
              Type: {emp.emp_type}, Salary: {emp.salary}
            </li>
          ))}
        </ul>
      ) : (
        <p>No data available.</p>
      )}
    </div>
  );
}

export default EmployeeSupervisors;
