// import React, { useState, useEffect, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import { useSwipeable } from "react-swipeable";
// import Calendar from "react-calendar";
// import {
//   FaUserCircle,
//   FaBell,
//   FaCalendarAlt,
//   FaChevronLeft,
//   FaChevronRight,
// } from "react-icons/fa";
// import "react-calendar/dist/Calendar.css";
// import "bootstrap/dist/css/bootstrap.min.css";
// import "./dashboard-sidebar.css";

// function Dashboardside() {
//   const navigate = useNavigate();
//   const [date, setDate] = useState<Date | null>(new Date());
//   const [showCalendar, setShowCalendar] = useState(false);
//   const [showNotifications, setShowNotifications] = useState(false);
//   const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
//   const [tasks, setTasks] = useState([
//     { id: 1, text: "Schedule post Dusk&Dawn", completed: false },
//     { id: 2, text: "Design post for Idol", completed: false },
//     { id: 3, text: "Brainstorming new project", completed: false },
//     { id: 4, text: "Re-Branding Discussion", completed: false },
//     { id: 5, text: "User Research", completed: false },
//   ]);

//   const notificationsRef = useRef<HTMLDivElement | null>(null);

//   useEffect(() => {
//     const handleResize = () => {
//       setSidebarOpen(window.innerWidth >= 768);
//     };

//     window.addEventListener("resize", handleResize);
//     return () => {
//       window.removeEventListener("resize", handleResize);
//     };
//   }, []);

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (
//         notificationsRef.current &&
//         !notificationsRef.current.contains(event.target as Node)
//       ) {
//         setShowNotifications(false);
//       }
//     };

//     if (showNotifications) {
//       document.addEventListener("mousedown", handleClickOutside);
//     } else {
//       document.removeEventListener("mousedown", handleClickOutside);
//     }

//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [showNotifications]);

//   const toggleTaskCompletion = (id: number) => {
//     setTasks(
//       tasks.map((task) =>
//         task.id === id ? { ...task, completed: !task.completed } : task
//       )
//     );
//   };

//   const handlers = useSwipeable({
//     onSwipedLeft: () => window.innerWidth < 768 && setSidebarOpen(false),
//     onSwipedRight: () => window.innerWidth < 768 && setSidebarOpen(true),
//     preventScrollOnSwipe: true,
//     trackMouse: false,
//   });

//   return (
//     <React.Fragment>
//       <div
//         {...handlers}
//         className={`dashboard-container ${sidebarOpen ? "open" : ""}`}
//       >
//         <button
//           className="sidebar-toggle rounded-left-5"
//           onClick={() => setSidebarOpen(!sidebarOpen)}
//         >
//           {sidebarOpen ? (
//             <FaChevronRight size={20} />
//           ) : (
//             <FaChevronLeft size={20} />
//           )}
//         </button>

//         <div className={`dashboard-sidebar ${sidebarOpen ? "show" : ""}`}>
//           <div className="user-section">
//             <FaUserCircle
//               className="user-icon"
//               size={30}
//               onClick={() => navigate("/profile")}
//               style={{ cursor: "pointer" }}
//             />
//             <span className="fw-bold">User</span>
//           </div>

//           <hr className="divider" />

//           <div className="icon-section">
//             <FaCalendarAlt
//               className="icon"
//               size={22}
//               onClick={() => setShowCalendar(!showCalendar)}
//             />
//             <FaBell
//               className="icon"
//               size={22}
//               onClick={() => setShowNotifications(!showNotifications)}
//             />
//           </div>

//           <div
//             className={`notifications-panel ${showNotifications ? "show" : ""}`}
//             ref={notificationsRef}
//           >
//             <h6 className="text-dark fw-bold">🔔 Notifications</h6>
//             <div className="notification-item text-danger">
//               <FaBell className="me-2 text-danger" /> Deadline: Rebranding
//               meeting in 1 hour.
//             </div>
//             <div className="notification-item text-success">
//               <FaBell className="me-2 text-success" /> Task Update: 2 completed,
//               3 pending.
//             </div>
//             <div className="notification-item text-warning">
//               <FaBell className="me-2 text-warning" /> Taskly AI: Work planning
//               made easier!
//             </div>
//           </div>

//           {showCalendar && (
//             <div className="calendar-section">
//               <Calendar
//                 onChange={setDate}
//                 value={date}
//                 className="custom-calendar"
//               />
//             </div>
//           )}

//           <div className="task-section">
//             <h6 className="task-title">📝 Tasks</h6>
//             {tasks.map((task) => (
//               <div
//                 key={task.id}
//                 className={`task-item ${task.completed ? "completed" : ""}`}
//               >
//                 <input
//                   type="checkbox"
//                   checked={task.completed}
//                   onChange={() => toggleTaskCompletion(task.id)}
//                   className="me-2"
//                 />
//                 {task.text}
//               </div>
//             ))}
//             <button className="schedule-btn mt-3">Schedule Task</button>
//           </div>
//         </div>
//       </div>
//     </React.Fragment>
//   );
// }

// export default Dashboardside;
