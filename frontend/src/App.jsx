import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import axios from 'axios';

const STATUSES = [
  { key: 'todo', label: 'To Do' },
  { key: 'inprogress', label: 'In Progress' },
  { key: 'done', label: 'Done' },
];

const baseURL = 'https://task-board-backend-y5zc.onrender.com';
export const fetchTasks = async () => {
  const response = await fetch(`${baseURL}/tasks`);
  const data = await response.json();
  return data;
};

function App() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetchTasks().then(setTasks);
  }, []);

  return (
    <div>
      <h1>Task List</h1>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>{task.title}</li>
        ))}
      </ul>
    </div>
  );
}


  const onDragEnd = async ({ source, destination, draggableId }) => {
    if (!destination) return;
    const taskId = parseInt(draggableId);
    const task = tasks.find(t => t.id === taskId);
    const updated = { ...task, status: destination.droppableId };
    await axios.put(`${baseURL}/tasks/${taskId}`, updated);
    setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
  };

  const createTask = async () => {
    const title = prompt("New task title");
    if (!title) return;
    const newTask = { id: 0, title, description: "", status: 'todo' };
    const res = await axios.post(`${baseURL}/tasks`, newTask);
    setTasks(prev => [...prev, res.data]);
  };

  const deleteTask = async (id) => {
    await axios.delete(`${baseURL}/tasks/${id}`);
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="p-4 flex gap-4">
      <button
        onClick={createTask}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >+ New Task</button>
      <DragDropContext onDragEnd={onDragEnd}>
        {STATUSES.map(status => (
          <Droppable key={status.key} droppableId={status.key}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="bg-gray-100 p-2 rounded w-64 min-h-[400px]"
              >
                <h2 className="text-lg font-semibold mb-2">{status.label}</h2>
                {tasks
                  .filter(t => t.status === status.key)
                  .map((task, index) => (
                    <Draggable
                      key={task.id}
                      draggableId={`${task.id}`}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="bg-white p-3 mb-2 rounded shadow"
                        >
                          <div className="flex justify-between">
                            <span>{task.title}</span>
                            <button
                              onClick={() => deleteTask(task.id)}
                              className="text-red-500"
                            >×</button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </DragDropContext>
    </div>
  );
}

export default App;

