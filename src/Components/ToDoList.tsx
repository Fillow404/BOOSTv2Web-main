import React, { useState, useEffect } from "react";
import { Button, Modal, Form, FormCheck } from "react-bootstrap";
import "./ToDoList.css";
import { db, auth } from "../firebase";
import { Timestamp, serverTimestamp, FieldValue } from "firebase/firestore";
import {
  doc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { v4 as uuidv4 } from "uuid";
import { MdDelete } from "react-icons/md";
import { FaCalendarAlt, FaEdit } from "react-icons/fa";
import { AlarmClock } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { BsPlusLg } from "react-icons/bs";
import { BsInfoCircle } from "react-icons/bs";

interface Task {
  id: string;
  title: string;
  description: string;
  tags: string[];
  dueDate: Date | null;
  checklist: { text: string; checked: boolean }[];
  progress: number;
  timeLeft: string;
  completed: boolean;
  priority: string;
  status: string;
  userId: string;
  createdAt: Timestamp | FieldValue | null;
  completedTime: string | null;
}

const FcTodoList: React.FC = () => {
  const [_showModal, _setShowModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showAddTaskModalInfo, setShowAddTaskModalInfo] = useState(false);
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [user, setUser] = useState<import("firebase/auth").User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState<Task>({
    id: "",
    title: "",
    description: "",
    tags: [],
    dueDate: null,
    checklist: [],
    progress: 0,
    timeLeft: "",
    completed: false,
    createdAt: null,
    priority: "",
    status: "pending",
    userId: "",
    completedTime: null,
  });
  const [dueDateError, setDueDateError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [_xp, setXp] = useState<number>(0);

  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  const handleEditTaskShow = (task: Task) => {
    setTaskToEdit(task);
    setShowEditTaskModal(true);
  };

  const handleEditTaskClose = () => {
    setShowEditTaskModal(false);
    setTaskToEdit(null);
  };

  const handleEditTask = async (updatedTask: Task | null) => {
    if (!updatedTask || !user) return;

    try {
      const taskRef = doc(db, "users", user.uid, "todolist", updatedTask.id);
      await updateDoc(taskRef, {
        title: updatedTask.title,
        description: updatedTask.description,
        priority: updatedTask.priority,
      });

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === updatedTask.id ? { ...task, ...updatedTask } : task
        )
      );

      handleEditTaskClose();
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((userAuth) => {
      setUser(userAuth);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchTasks = async () => {
      setError(null);
      if (user) {
        try {
          const q = query(
            collection(db, "users", user.uid, "todolist"),
            where("userId", "==", user.uid)
          );
          const querySnapshot = await getDocs(q);
          const fetchedTasks: Task[] = [];
          querySnapshot.forEach((doc) => {
            fetchedTasks.push({ id: doc.id, ...doc.data() } as Task);
          });
          setTasks(fetchedTasks);
        } catch (error) {
          setError("Error fetching tasks. Please try again later.");
          console.error("Error fetching tasks:", error);
        }
      }
    };

    fetchTasks();
  }, [user]);

  useEffect(() => {
    const fetchXp = async () => {
      if (user) {
        try {
          const userRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setXp(userData.xp || 0);
          }
        } catch (error) {
          console.error("Error fetching XP:", error);
        }
      }
    };

    fetchXp();
  }, [user]);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setShowChecklistModal(true);
  };

  const handleChecklistModalClose = () => {
    setShowChecklistModal(false);
    setSelectedTask(null);
  };

  const handleAddTaskShow = () => setShowAddTaskModal(true);
  const handleAddTaskClose = () => {
    setShowAddTaskModal(false);
    setNewTask({
      id: "",
      title: "",
      description: "",
      tags: [],
      dueDate: null,
      checklist: [],
      progress: 0,
      timeLeft: "",
      completed: false,
      createdAt: null,
      priority: "",
      status: "pending",
      userId: "",
      completedTime: null,
    });
    setDueDateError(false);
    setError(null);
  };

  const handleAddTaskChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    if (name === "tags") {
      setNewTask((prev) => ({ ...prev, tags: value.split(",") }));
    } else {
      setNewTask((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddChecklist = () => {
    setNewTask((prev) => ({
      ...prev,
      checklist: [...prev.checklist, { text: "", checked: false }],
    }));
  };

  const handleAddTask = async () => {
    setError(null);

    if (!newTask.title.trim()) {
      setError("Task title is required.");
      return;
    }
    if (!newTask.dueDate) {
      setError("Task due date and time are required.");
      return;
    }

    try {
      if (!user) return;

      if (newTask.dueDate && newTask.dueDate < new Date()) {
        setDueDateError(true);
        return;
      }

      const newTaskWithId = {
        ...newTask,
        id: uuidv4(),
        createdAt: serverTimestamp(),
        timeLeft: calculateTimeLeft(newTask.dueDate),
        userId: user.uid,
        status: "pending",
        completedTime: null,
      };

      await setDoc(
        doc(db, "users", user.uid, "todolist", newTaskWithId.id),
        newTaskWithId
      );
      setTasks([...tasks, newTaskWithId]);
      handleAddTaskClose();
    } catch (error) {
      setError("Error adding task. Please try again later.");
      console.error("Error adding task:", error);
    }
  };

  const handleMoveToOnProgress = async (id: string) => {
    setError(null);
    if (user) {
      try {
        const taskRef = doc(db, "users", user.uid, "todolist", id);
        await updateDoc(taskRef, { status: "onProgress" });
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === id ? { ...task, status: "onProgress" } : task
          )
        );
      } catch (error) {
        setError("Error moving task to On Progress. Please try again later.");
        console.error("Error moving task to On Progress:", error);
      }
    }
  };

  const handleMarkAsCompleted = async (id: string) => {
    setError(null);
    if (user) {
      try {
        const taskRef = doc(db, "users", user.uid, "todolist", id);
        await updateDoc(taskRef, { status: "completed" });
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === id ? { ...task, status: "completed" } : task
          )
        );

        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const currentExp = userDoc.data().exp || 0;
          const newExp = currentExp + 5;
          await updateDoc(userRef, { exp: newExp });
        }
      } catch (error) {
        setError("Error marking task as completed. Please try again later.");
        console.error("Error marking task as completed:", error);
      }
    }
  };

  const handleDeleteTask = async (id: string) => {
    setError(null);
    if (user) {
      try {
        await deleteDoc(doc(db, "users", user.uid, "todolist", id));
        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
      } catch (error) {
        setError("Error deleting task. Please try again later.");
        console.error("Error deleting task:", error);
      }
    }
  };

  const formatDate = (date: Date | null | Timestamp): string => {
    if (!date) return "";
    const dateObj = date instanceof Timestamp ? date.toDate() : date;
    return dateObj.toLocaleDateString();
  };

  const formatTime = (date: Date | null | Timestamp): string => {
    if (!date) return "";
    const dateObj = date instanceof Timestamp ? date.toDate() : date;
    return dateObj.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const calculateTimeLeft = (dueDate: Date | null): string => {
    if (!dueDate) return "";
    const now = new Date();
    const diff = dueDate.getTime() - now.getTime();
    if (diff < 0) return "Overdue";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    let timeLeftString = "";
    if (days > 0) timeLeftString += `${days}d `;
    if (hours > 0) timeLeftString += `${hours}h `;
    timeLeftString += `${minutes}m`;
    return timeLeftString;
  };
  const motivationalMessages = [
    "Take one step today toward your goal — even a small one matters.",
    "Keep pushing forward — your effort is building progress.",
    "Break your work into small, manageable steps and complete one now.",
    "Stay focused — eliminate distractions and commit to the task at hand.",
    "Complete one task and build momentum for the rest of your day.",
    "Repeat small productive habits — they create long-term success.",
    "Don’t wait — start now and build as you go.",
    "Begin with a small win — check off a simple task first.",
    "Take initiative — the sooner you start, the sooner you succeed.",
    "Trust your routine and stick to it today.",
    "Take five minutes to refocus, then return with purpose.",
    "Finish one important task before you move to the next.",
    "Write down your top priority and take action on it now.",
    "Be consistent — show up for your goals even if motivation fades.",
    "Choose progress over perfection — complete something now.",
    "Break a big goal into a smaller action and start with that.",
    "Use this moment to build a productive habit.",
    "Push through resistance — the hardest part is starting.",
    "Give yourself credit — then keep moving forward.",
    "Visualize the result and take the next right step toward it.",
  ];

  const randomMessage =
    motivationalMessages[
      Math.floor(Math.random() * motivationalMessages.length)
    ];

  const renderTaskCard = (task: Task) => {
    const isClickable = task.checklist && task.checklist.length > 0;

    return (
      <div
        className="pb-3"
        key={task.id}
        onClick={isClickable ? () => handleTaskClick(task) : undefined}
        style={{ cursor: isClickable ? "pointer" : "default" }}
      >
        <div className="card p-3 task-card-responsive taskCard">
          <div className="d-flex align-items-center  justify-content-between">
            <span className="badge text-light bg-success mr-auto ">
              {task.timeLeft}
            </span>
            <div>
              {task.status !== "completed" && (
                <FaEdit
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditTaskShow(task);
                  }}
                  size={22}
                  style={{ cursor: "pointer", marginRight: "10px" }}
                />
              )}
              <MdDelete
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteTask(task.id);
                }}
                size={22}
                style={{ cursor: "pointer" }}
              />
            </div>
          </div>
          <h5 className="mt-2">{task.title}</h5>
          <p className="text-muted">{task.description}</p>
          <p
            className={`badge badge-success text-light text-start rounded border text-center  ${
              task.priority === "Low" ? "col-md-2" : "col-md-3"
            } ${task.priority === "Low" ? "ps-1" : "ps-2"}`}
            style={{ backgroundColor: "#60BF9D" }}
          >
            {task.priority}
          </p>
          <div>
            {task.tags.map((tag, index) => (
              <span key={index} className="badge bg-secondary me-1">
                {tag}
              </span>
            ))}
          </div>

          <div className="d-flex justify-content-between align-items-center mt-3 p-2 bg-light rounded">
            <div className="d-flex align-items-center ">
              <span>
                <FaCalendarAlt
                  size={25}
                  className="me-1 p-1 rounded border shadow"
                  color="blue"
                  style={{ borderColor: "gray" }}
                />
                {formatDate(task.dueDate)}
              </span>
            </div>
            <div className="d-flex align-items-center ">
              <AlarmClock
                size={25}
                className="me-1 p-1 rounded-circle border shadow"
                color="orange"
                style={{ borderColor: "gray" }}
              />
              {formatTime(task.dueDate)}
            </div>
          </div>
          <div className="mt-3 d-flex gap-2">
            {task.status === "pending" && (
              <Button
                variant="success"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleMoveToOnProgress(task.id);
                }}
              >
                Working On
              </Button>
            )}
            {task.status === "onProgress" && (
              <Button
                variant="success"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleMarkAsCompleted(task.id);
                }}
              >
                Complete
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };
  const handleDragEnd = (result: any) => {
    const { source, destination } = result;

    if (!destination) {
      return;
    }

    // Reorder the checklist items
    const reorderedChecklist = Array.from(selectedTask?.checklist || []);
    const [removed] = reorderedChecklist.splice(source.index, 1);
    reorderedChecklist.splice(destination.index, 0, removed);

    // Update the checklist state after reordering
    setSelectedTask((prev) =>
      prev ? { ...prev, checklist: reorderedChecklist } : null
    );

    // Optionally, update Pangea with the new order
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center">
        <h2 className="pt-2 ps-3 mb-0">To-Do List</h2>
        <BsInfoCircle
          size={25}
          style={{ color: "#0d6efd", cursor: "pointer" }}
          className="me-3"
          onClick={() => setShowAddTaskModalInfo(true)}
        />
      </div>
      <Modal
        show={showAddTaskModalInfo}
        onHide={() => setShowAddTaskModalInfo(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Tips the To-Do List & How to add task</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ol className="ps-3">
            <li>
              Click on the <strong>+ Add Task</strong> button at the
              bottom-right corner to create a new task.
            </li>
            <li>
              Enter a title, optional details, and checklist items for better
              organization.
            </li>
            <li>
              Use checkboxes to track your progress and mark tasks as complete.
            </li>
            <li>Edit or delete tasks anytime to keep your list up to date.</li>
            <li>
              Stay consistent — updating your list regularly boosts
              productivity.
            </li>
          </ol>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowAddTaskModalInfo(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      <p className="ps-3 text-muted fst-italic" style={{ fontSize: "0.95rem" }}>
        Start by choosing one meaningful task and commit to completing it with
        focus. Break goals into smaller actions and make steady progress,
        prioritizing consistency over perfection. Trust the process, minimize
        distractions, and let discipline guide your day.
      </p>
      <p className="ps-3 text-muted fst-italic" style={{ fontSize: "0.95rem" }}>
        {randomMessage}
      </p>

      <div className="board-container flex gap-4">
        <div className="task-column">
          <span className="icons col-sm-auto">
            <svg height={13} width={10}>
              <circle fill="blue" cx={5} cy={5} r={5} />
            </svg>
          </span>
          <span className="ps-2 fw-medium text col-sm-auto">On Progress</span>

          <svg height="2%" width="100%" className="mb-4 mt-2">
            <line x1="0" y1="10" x2="100%" y2="10" id="custom-line1" />
          </svg>
          <div className="CardTask">
            {tasks
              .filter((task) => task.status === "onProgress")
              .map(renderTaskCard)}
          </div>
        </div>
        <div className="task-column">
          <span className="icons col-sm-auto">
            <svg height={13} width={10}>
              <circle fill="yellow" cx={5} cy={5} r={5} />
            </svg>
          </span>
          <span className="ps-2 fw-medium text col-sm-auto">Pending</span>

          <svg height="2%" width="100%" className="mb-4 mt-2">
            <line x1="0" y1="10" x2="100%" y2="10" id="custom-line2" />
          </svg>
          <div className="CardTask">
            {tasks
              .filter((task) => task.status === "pending")
              .map(renderTaskCard)}
          </div>
        </div>
        <div className="task-column">
          <div className="row">
            <span className="icons col-sm-auto">
              <svg height={13} width={10}>
                <circle fill="green" cx={5} cy={5} r={5} />
              </svg>
            </span>
            <span className="ps-2 fw-medium text col-sm-auto">Completed</span>
          </div>
          <svg height="2%" width="100%" className="mb-4 mt-2">
            <line x1="0" y1="10" x2="100%" y2="10" id="custom-line3" />
          </svg>
          <div className="CardTask">
            {tasks
              .filter((task) => task.status === "completed")
              .map(renderTaskCard)}
          </div>
        </div>
      </div>
      <div
        className="add-task-container position-fixed bottom-0 end-0 m-4"
        style={{ zIndex: 1050 }}
      >
        <button
          className="add-task d-flex align-items-center justify-content-center gap-2 rounded-pill shadow"
          onClick={handleAddTaskShow}
          style={{
            backgroundColor: "#0d6efd",
            color: "#fff",
            border: "none",
            fontWeight: "bold",
            fontSize: "0.95rem",
            padding: "0.6rem 1.2rem",
            cursor: "pointer",
          }}
        >
          <BsPlusLg size={18} />
          <span>Add Task</span>
        </button>
      </div>

      <Modal
        show={showAddTaskModal}
        onHide={handleAddTaskClose}
        centered
        className="add-task-modal"
        backdrop={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Start a New Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <div className="d-flex">
                <Form.Label
                  htmlFor="taskTitle"
                  className="d-flex justify-self-center mt-3 pe-3"
                >
                  Title:
                </Form.Label>
                <Form.Control
                  type="text"
                  id="taskTitle"
                  name="title"
                  value={newTask.title}
                  onChange={handleAddTaskChange}
                  placeholder="Enter task title"
                  required
                />
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <div className="d-flex">
                <Form.Label htmlFor="taskDescription" className="mt-3 pe-3">
                  Description:{" "}
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  id="taskDescription"
                  name="description"
                  value={newTask.description}
                  onChange={handleAddTaskChange}
                  placeholder="Enter task description"
                />
              </div>
            </Form.Group>

            {/* Task Tags */}
            <Form.Group className="mb-3">
              <div className="d-flex">
                <Form.Label htmlFor="taskTags" className="mt-3 pe-3">
                  Tags:
                </Form.Label>
                <Form.Control
                  type="text"
                  id="taskTags"
                  name="tags"
                  value={newTask.tags.join(",")}
                  onChange={handleAddTaskChange}
                  placeholder="comma-separated"
                />
              </div>
            </Form.Group>

            {/* Task Due Date */}
            <Form.Group className="mb-3">
              <div className="d-flex">
                <Form.Label htmlFor="taskDueDate" className="mt-3 pe-3">
                  Due Date & Time:{" "}
                </Form.Label>
                <DatePicker
                  id="taskDueDate"
                  selected={newTask.dueDate}
                  onChange={(date) =>
                    setNewTask((prev) => ({ ...prev, dueDate: date }))
                  }
                  name="dueDate"
                  className="form-control"
                  showTimeSelect
                  timeIntervals={1}
                  timeCaption="Time"
                  dateFormat="MMMM d, yyyy h:mm aa"
                  minDate={new Date()}
                  placeholderText="Select due date and time"
                  autoComplete="off"
                />
                {dueDateError && (
                  <p className="text-danger">
                    Due date and time cannot be in the past.
                  </p>
                )}
              </div>
            </Form.Group>

            {/* Task Priority */}
            <Form.Group className="mb-3">
              <div className="d-flex">
                <Form.Label className="mt-3 pe-3">Priority:</Form.Label>
                <Form.Select
                  value={newTask.priority}
                  onChange={(e) =>
                    setNewTask((prev) => ({
                      ...prev,
                      priority: e.target.value,
                    }))
                  }
                >
                  <option value="">Select Priority</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </Form.Select>
              </div>
            </Form.Group>

            {/* Task Checklist */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold fs-5">Checklist</Form.Label>
              <DragDropContext
                onDragEnd={(result) => {
                  if (!result.destination) return;

                  const items = Array.from(newTask.checklist);
                  const [reorderedItem] = items.splice(result.source.index, 1);
                  items.splice(result.destination.index, 0, reorderedItem);

                  setNewTask((prev) => ({
                    ...prev,
                    checklist: items,
                  }));
                }}
              >
                <Droppable droppableId="checklist">
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps}>
                      {newTask.checklist.map((item, index) => (
                        <Draggable
                          key={index}
                          draggableId={`item-${index}`}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              className="mb-3 p-2 d-flex align-items-center justify-content-between border rounded shadow-sm"
                              style={{ backgroundColor: "#f8f9fa" }}
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <Form.Check
                                type="checkbox"
                                checked={item.checked}
                                onChange={(e) => {
                                  const updatedChecklist = [
                                    ...newTask.checklist,
                                  ];
                                  updatedChecklist[index].checked =
                                    e.target.checked;
                                  setNewTask((prev) => ({
                                    ...prev,
                                    checklist: updatedChecklist,
                                  }));
                                }}
                                className="me-2"
                              />
                              <Form.Control
                                type="text"
                                value={item.text}
                                onChange={(e) => {
                                  const updatedChecklist = [
                                    ...newTask.checklist,
                                  ];
                                  updatedChecklist[index].text = e.target.value;
                                  setNewTask((prev) => ({
                                    ...prev,
                                    checklist: updatedChecklist,
                                  }));
                                }}
                                className="me-3 flex-grow-1"
                                placeholder="Enter checklist item"
                              />
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => {
                                  const updatedChecklist =
                                    newTask.checklist.filter(
                                      (_, i) => i !== index
                                    );
                                  setNewTask((prev) => ({
                                    ...prev,
                                    checklist: updatedChecklist,
                                  }));
                                }}
                              >
                                Delete
                              </Button>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </Form.Group>

            <Button variant="link" onClick={handleAddChecklist}>
              Add Checklist Item
            </Button>

            {error && <p className="text-danger">{error}</p>}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleAddTaskClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleAddTask}>
            Add Task
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showChecklistModal}
        onHide={handleChecklistModalClose}
        centered
        className="checklist-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>{selectedTask?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex flex-column">
            {/* Displaying the task description */}
            {selectedTask?.description && (
              <div className="mb-4">
                <p className="text-muted text-start">
                  {selectedTask.description}
                </p>
              </div>
            )}

            {/* Checklist with drag-and-drop */}
            {selectedTask?.checklist.length ? (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="checklist" type="list">
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="checklist-container"
                    >
                      {selectedTask.checklist.map((item, index) => (
                        <Draggable
                          key={index}
                          draggableId={`item-${index}`}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="checklist-item d-flex align-items-center mb-3 p-3 border border-2 rounded shadow-sm"
                            >
                              <FormCheck
                                type="checkbox"
                                label={item.text}
                                checked={item.checked}
                                onChange={() => {
                                  const updatedChecklist = [
                                    ...(selectedTask?.checklist || []),
                                  ];
                                  updatedChecklist[index].checked =
                                    !updatedChecklist[index].checked;
                                  setSelectedTask((prev) =>
                                    prev
                                      ? { ...prev, checklist: updatedChecklist }
                                      : null
                                  );
                                }}
                                className="me-3"
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            ) : (
              <p className="text-muted text-start">
                No checklist items available.
              </p>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleChecklistModalClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showEditTaskModal}
        onHide={handleEditTaskClose}
        centered
        className="edit-task-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {taskToEdit && (
            <Form>
              <Form.Group className="mb-3">
                <div className="d-flex">
                  <Form.Label
                    htmlFor="taskTitle"
                    className="d-flex justify-self-center mt-3 pe-3"
                  >
                    Title:
                  </Form.Label>
                  <Form.Control
                    type="text"
                    id="editTaskTitle"
                    value={taskToEdit.title}
                    onChange={(e) =>
                      setTaskToEdit((prev) =>
                        prev ? { ...prev, title: e.target.value } : null
                      )
                    }
                    placeholder="Enter task title"
                    required
                  />
                </div>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label htmlFor="editTaskDescription">
                  Description
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  id="editTaskDescription"
                  value={taskToEdit.description}
                  onChange={(e) =>
                    setTaskToEdit((prev) =>
                      prev ? { ...prev, description: e.target.value } : null
                    )
                  }
                  placeholder="Enter task description"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label htmlFor="editTaskTags">
                  Tags (comma-separated)
                </Form.Label>
                <Form.Control
                  type="text"
                  id="editTaskTags"
                  value={taskToEdit.tags.join(",")}
                  onChange={(e) =>
                    setTaskToEdit((prev) =>
                      prev
                        ? {
                            ...prev,
                            tags: e.target.value
                              .split(",")
                              .map((tag) => tag.trim()),
                          }
                        : null
                    )
                  }
                  placeholder="Enter tags"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Priority</Form.Label>
                <Form.Select
                  value={taskToEdit.priority}
                  onChange={(e) =>
                    setTaskToEdit((prev) =>
                      prev ? { ...prev, priority: e.target.value } : null
                    )
                  }
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </Form.Select>
              </Form.Group>

              <Form.Label>Checklist</Form.Label>
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="editable-checklist">
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps}>
                      {taskToEdit.checklist.map((item, index) => (
                        <Draggable
                          key={`checklist-${index}`}
                          draggableId={`checklist-${index}`}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              className="mb-2 d-flex align-items-center"
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <Form.Control
                                type="text"
                                value={item.text}
                                onChange={(e) => {
                                  const updatedChecklist = [
                                    ...(taskToEdit?.checklist || []),
                                  ];
                                  updatedChecklist[index].text = e.target.value;
                                  setTaskToEdit((prev) =>
                                    prev
                                      ? { ...prev, checklist: updatedChecklist }
                                      : null
                                  );
                                }}
                                className="me-2"
                              />
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => {
                                  const updatedChecklist =
                                    taskToEdit?.checklist.filter(
                                      (_, i) => i !== index
                                    );
                                  setTaskToEdit((prev) =>
                                    prev
                                      ? {
                                          ...prev,
                                          checklist: updatedChecklist || [],
                                        }
                                      : null
                                  );
                                }}
                              >
                                Delete
                              </Button>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>

              <Button
                variant="link"
                onClick={() =>
                  setTaskToEdit((prev) =>
                    prev
                      ? {
                          ...prev,
                          checklist: [
                            ...prev.checklist,
                            { text: "", checked: false },
                          ],
                        }
                      : null
                  )
                }
              >
                Add Checklist Item
              </Button>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleEditTaskClose}>
            Close
          </Button>
          <Button variant="primary" onClick={() => handleEditTask(taskToEdit)}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default FcTodoList;
