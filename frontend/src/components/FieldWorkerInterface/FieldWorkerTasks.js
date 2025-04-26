import React from "react"
import { useState, useEffect } from "react"
import { fieldWorkerAPI } from "../../api/api"
import "./FieldWorkerTasks.css"

const FieldWorkerTasks = () => {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        console.log('Fetching assigned tasks...');
        const response = await fieldWorkerAPI.getAssignedTasks();
        console.log('API Response:', response);
        
        if (response.data && response.data.tasks) {
          setTasks(response.data.tasks);
        } else if (response.data) {
          // If tasks are returned directly in the response.data
          setTasks(response.data);
        } else {
          setTasks([]);
        }
        
        setError(null);
      } catch (err) {
        console.error("Error fetching tasks:", err);
        setError("Failed to fetch tasks. Please try again later.");
        
        // For development: use mock data when API fails
        setTasks([
          {
            id: 1,
            description: "Distribute food supplies in Zone A",
            status: "pending",
            dateProvided: new Date().toISOString().split('T')[0]
          },
          {
            id: 2,
            description: "Medical checkups in Zone B",
            status: "completed",
            dateProvided: new Date().toISOString().split('T')[0]
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  return (
    <div className="field-worker-tasks">
      <h2>Your Tasks</h2>
      {loading ? (
        <p>Loading tasks...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : tasks.length > 0 ? (
        <ul>
          {tasks.map((task) => (
            <li key={task._id || task.id} className={`task-item task-${task.status.toLowerCase().replace(" ", "-")}`}>
              <div className="task-header">
                <strong>{task.description}</strong>
                <span className="status">{task.status}</span>
              </div>
              <div className="task-meta">
                <span className="date">Date: {new Date(task.dateProvided).toLocaleDateString()}</span>
                {task.refugeeId && <span className="refugee">Refugee ID: {task.refugeeId}</span>}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No tasks assigned. Check back later for new assignments.</p>
      )}
    </div>
  );
};

export default FieldWorkerTasks;

