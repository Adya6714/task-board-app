from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn

# Pydantic model
tasks = {}
class Task(BaseModel):
    id: int
    title: str
    description: Optional[str] = ""
    status: str  # "todo" | "inprogress" | "done"

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize with some tasks
tasks_db: List[Task] = [
    Task(id=1, title="Sample Task 1", description="", status="todo"),
    Task(id=2, title="Sample Task 2", description="", status="inprogress"),
    Task(id=3, title="Sample Task 3", description="", status="done"),
]
next_id = 4

def get_task_index(task_id: int):
    for i, t in enumerate(tasks_db):
        if t.id == task_id:
            return i
    return None

@app.get("/tasks", response_model=List[Task])
def list_tasks():
    return tasks_db

@app.post("/tasks", response_model=Task)
def create_task(task: Task):
    global next_id
    task.id = next_id
    next_id += 1
    tasks_db.append(task)
    return task

@app.put("/tasks/{task_id}", response_model=Task)
def update_task(task_id: int, updated: Task):
    idx = get_task_index(task_id)
    if idx is None:
        raise HTTPException(status_code=404, detail="Task not found")
    tasks_db[idx] = updated
    return updated

@app.delete("/tasks/{task_id}")
def delete_task(task_id: int):
    idx = get_task_index(task_id)
    if idx is None:
        raise HTTPException(status_code=404, detail="Task not found")
    tasks_db.pop(idx)
    return {"detail": "Deleted"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
