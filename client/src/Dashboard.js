import React, { useState, useEffect } from 'react';
import './Dashboard.css';

function Dashboard() {
  const [attempts, setAttempts] = useState([]);

  useEffect(() => {
    fetchAttempts();
  }, []);

  const fetchAttempts = async () => {
    try {
      const response = await fetch('http://localhost:5000/attempts');
      if (response.ok) {
        const data = await response.json();
        setAttempts(data);
      } else {
        console.error('Failed to fetch attempts');
      }
    } catch (error) {
      console.error('Error fetching attempts:', error);
    }
  };

  return (
    <div className="dashboard-container">
      <h2>Your Progress</h2>
      {attempts.length === 0 ? (
        <p>You haven't taken any quizzes yet.</p>
      ) : (
        <ul className="attempts-list">
          {attempts.map((attempt) => (
            <li key={attempt._id} className="attempt-item">
              <span className="pdf-name">{attempt.pdfName}</span>
              <span className="score">Score: {attempt.score} / {attempt.total}</span>
              <span className="date">
                {new Date(attempt.createdAt).toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Dashboard;