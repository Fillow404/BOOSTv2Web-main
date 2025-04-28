import { useEffect, useState } from "react";
import { faTasks, faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FaBell } from "react-icons/fa";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  query,
  getDocs,
  orderBy,
  limit,
  onSnapshot,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { format } from "date-fns";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./exp-notif-cal.css";

export default function ExpNotifCal() {
  const [exp, setExp] = useState<number | null>(null);
  const [level, setLevel] = useState<number | null>(0);
  const [xp, setXp] = useState<string>("0/0XP");
  const [dueNotifications, setDueNotifications] = useState<any[]>([]);
  const [overdueNotifications, setOverdueNotifications] = useState<any[]>([]);
  const [xpNotifications, setXpNotifications] = useState<any[]>([]);
  const [isNotifFloating, setIsNotifFloating] = useState(false);
  const [isCalFloating, setIsCalFloating] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [tasksDueDates, setTasksDueDates] = useState<Date[]>([]);
  const [tasksForSelectedDate, setTasksForSelectedDate] = useState<any[]>([]);
  const [lastSeenNotifTime, setLastSeenNotifTime] = useState<Date | null>(null);
  const [latestNotifTime, setLatestNotifTime] = useState<Date | null>(null);

  const clearAllNotifications = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const db = getFirestore();
        const batch = writeBatch(db); // Create a batch

        // Delete due notifications
        dueNotifications.forEach((note) => {
          const docRef = doc(db, "users", user.uid, "todolist", note.id);
          batch.delete(docRef);
        });

        // Delete overdue notifications
        overdueNotifications.forEach((note) => {
          const docRef = doc(db, "users", user.uid, "todolist", note.id);
          batch.delete(docRef);
        });

        // Delete XP notifications
        xpNotifications.forEach((note) => {
          const docRef = doc(db, "users", user.uid, "xpHistory", note.id);
          batch.delete(docRef);
        });

        await batch.commit(); // Commit the batch

        // Update local state AFTER successful deletion
        setDueNotifications([]);
        setOverdueNotifications([]);
        setXpNotifications([]);
      }
    } catch (error) {
      console.error("Error clearing all notifications:", error);
    }
  };

  useEffect(() => {
    const handleStorage = () => {
      const lastSeen = localStorage.getItem("lastSeenNotifTime");
      if (lastSeen) {
        setLastSeenNotifTime(new Date(lastSeen));
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    const lastSeen = localStorage.getItem("lastSeenNotifTime");
    if (lastSeen) {
      setLastSeenNotifTime(new Date(lastSeen));
    }

    const fetchExpAndTodoList = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
          const db = getFirestore();
          const userDocRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const userData = docSnap.data();
            const currentExp = userData.exp || 0;
            const currentLevel = Math.floor(currentExp / 100);
            setExp(currentExp);
            setLevel(currentLevel);
            setXp(`${currentExp % 100}/100XP`);
          }

          const todoQuery = query(
            collection(db, "users", user.uid, "todolist")
          );
          const querySnapshot = await getDocs(todoQuery);

          const upcomingTasks: any[] = [];
          const overdueTasks: any[] = [];
          const taskDueDates: Date[] = [];

          const now = new Date();
          const startOfToday = new Date(now);
          startOfToday.setHours(0, 0, 0, 0);
          const oneDayLater = new Date(now);
          oneDayLater.setDate(now.getDate() + 1);

          querySnapshot.forEach((doc) => {
            const todoData = doc.data();
            if (todoData.dueDate) {
              const dueDate = todoData.dueDate.toDate();
              const taskId = doc.id; // Get the task ID

              if (dueDate >= startOfToday && dueDate <= oneDayLater) {
                upcomingTasks.push({
                  id: taskId,
                  title: todoData.title,
                  dueDate,
                });
                taskDueDates.push(dueDate);
              } else if (dueDate < now) {
                overdueTasks.push({
                  id: taskId,
                  title: todoData.title,
                  dueDate,
                });
                taskDueDates.push(dueDate);
              }
            }
          });

          const overdueFormatted = overdueTasks.map((task) => ({
            id: task.id, // Include ID
            title: task.title,
            date: format(task.dueDate, "MMMM d, yyyy"),
            time: format(task.dueDate, "hh:mm a"),
          }));

          const upcomingFormatted = upcomingTasks.map((task) => ({
            id: task.id, // Include ID
            title: task.title,
            date: format(task.dueDate, "MMMM d, yyyy"),
            time: format(task.dueDate, "hh:mm a"),
          }));

          setDueNotifications(upcomingFormatted);
          setOverdueNotifications(overdueFormatted);
          setTasksDueDates(taskDueDates);

          const xpHistoryRef = collection(db, "users", user.uid, "xpHistory");
          const xpHistoryQuery = query(
            xpHistoryRef,
            orderBy("timestamp", "desc"),
            limit(10)
          );
          const xpHistorySnapshot = await getDocs(xpHistoryQuery);
          const xpNotifs: any[] = [];

          xpHistorySnapshot.forEach((doc) => {
            const xpData = doc.data();
            const formattedDate = format(
              xpData.timestamp.toDate(),
              "MMMM d, yyyy"
            );
            const formattedTime = format(xpData.timestamp.toDate(), "hh:mm a");
            xpNotifs.push({
              id: doc.id, // Include ID
              title: `You earned ${xpData.xpAdded} XP!`,
              date: formattedDate,
              time: formattedTime,
            });
          });

          setXpNotifications(xpNotifs);

          let latestNotifDate: Date | null = null;

          if (xpHistorySnapshot.size > 0) {
            const firstXp = xpHistorySnapshot.docs[0].data();
            const xpDate = firstXp.timestamp.toDate();
            if (!latestNotifDate || xpDate > latestNotifDate)
              latestNotifDate = xpDate;
          }

          [...upcomingTasks, ...overdueTasks].forEach((task) => {
            const dueDate = task.dueDate;
            if (!latestNotifDate || dueDate > latestNotifDate)
              latestNotifDate = dueDate;
          });

          setLatestNotifTime(latestNotifDate);
        }
      } catch (error) {
        console.error("Error fetching user data or to-do list:", error);
      }
    };

    fetchExpAndTodoList();
  }, []);

  useEffect(() => {
    const fetchXpRealtime = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
          const db = getFirestore();
          const userDocRef = doc(db, "users", user.uid);

          const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
              const userData = docSnap.data();
              const currentExp = userData.exp || 0;
              const currentLevel = Math.floor(currentExp / 100);
              setExp(currentExp);
              setLevel(currentLevel);
              setXp(`${currentExp % 100}/100XP`);
            }
          });

          return () => unsubscribe();
        }
      } catch (error) {
        console.error("Error setting up XP listener:", error);
      }
    };

    fetchXpRealtime();
  }, []);

  const deleteNotification = async (
    type: "due" | "overdue" | "xp",
    id: string
  ) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const db = getFirestore();
        await deleteDoc(
          doc(
            db,
            "users",
            user.uid,
            type === "xp" ? "xpHistory" : "todolist",
            id
          )
        );

        if (type === "due") {
          setDueNotifications((prev) => prev.filter((note) => note.id !== id));
        } else if (type === "overdue") {
          setOverdueNotifications((prev) =>
            prev.filter((note) => note.id !== id)
          );
        } else if (type === "xp") {
          setXpNotifications((prev) => prev.filter((note) => note.id !== id));
        }
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const toggleNotifFloating = () => {
    const now = new Date();
    setIsNotifFloating(!isNotifFloating);
    setIsCalFloating(false);
    setLastSeenNotifTime(now);
    localStorage.setItem("lastSeenNotifTime", now.toISOString());
  };

  const toggleCalFloating = () => {
    setIsCalFloating(!isCalFloating);
    setIsNotifFloating(false);
  };

  const getDateKey = (date: Date) =>
    `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

  const tileClassName = ({ date }: { date: Date }) => {
    return tasksDueDates.some(
      (taskDate) => getDateKey(taskDate) === getDateKey(date)
    )
      ? "highlight"
      : "";
  };

  const fetchTasksForSelectedDate = async (date: Date) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const db = getFirestore();
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const todoQuery = query(
          collection(db, "users", user.uid, "todolist"),
          orderBy("dueDate")
        );

        const querySnapshot = await getDocs(todoQuery);
        const tasks: any[] = [];

        querySnapshot.forEach((doc) => {
          const todoData = doc.data();
          if (todoData.dueDate) {
            const dueDate = todoData.dueDate.toDate();
            if (dueDate >= startOfDay && dueDate <= endOfDay) {
              tasks.push({
                title: todoData.title,
                dueDate: dueDate,
                description: todoData.description || "No description available",
                time: format(dueDate, "hh:mm a"),
              });
            }
          }
        });

        setTasksForSelectedDate(tasks);
      }
    } catch (error) {
      console.error("Error fetching tasks for selected date:", error);
    }
  };

  return (
    <div className="container">
      {/* EXP & Icons */}
      <div className="exp-container pt-5 pb-5">
        <div className="exp-content">
          <span className="level-text">Level: {level}</span>
          <progress
            className="exp-bar"
            value={exp ? exp % 100 : 0}
            max={100}
          ></progress>
          <span className="xp-text">{xp}</span>
        </div>

        <div className="icons d-flex gap-3 align-items-center">
          <div className="bell-container position-relative">
            <FaBell
              className="icon notif"
              size={22}
              onClick={toggleNotifFloating}
            />
            {latestNotifTime &&
              (!lastSeenNotifTime || latestNotifTime > lastSeenNotifTime) && (
                <div className="notification-dot"></div>
              )}
          </div>
          <div className="calendar-icon">
            <FontAwesomeIcon
              icon={faCalendarAlt}
              size="lg"
              className="icon notif"
              onClick={toggleCalFloating}
            />
          </div>
        </div>
      </div>

      {/* Notifications Popup */}
      {isNotifFloating && (
        <div className="floating-popup">
          <div className="popup-header">
            <h3 className="fw-bold">Notifications</h3>
            <button
              onClick={toggleNotifFloating}
              className="close-btn"
            ></button>
          </div>
          <div className="todo-list">
            {/* Due Tasks */}
            {dueNotifications.length === 0 ? (
              <p>No upcoming tasks</p>
            ) : (
              dueNotifications.map((note) => (
                <div key={note.id} className="todo-card">
                  <h5 className="task-title">
                    <FontAwesomeIcon
                      icon={faTasks}
                      className="pe-2"
                      size="sm"
                    />
                    {note.title}
                  </h5>
                  <p className="due-date-time">
                    Due on {note.date} at {note.time}
                  </p>
                  <button
                    className="delete-btn"
                    onClick={() => deleteNotification("due", note.id)}
                  >
                    Delete
                  </button>
                </div>
              ))
            )}

            {/* Overdue Tasks */}
            {overdueNotifications.length === 0 ? (
              <p>No overdue tasks</p>
            ) : (
              overdueNotifications.map((note) => (
                <div key={note.id} className="todo-card">
                  <h5 className="task-title">
                    <FontAwesomeIcon
                      icon={faTasks}
                      className="pe-2"
                      size="sm"
                    />
                    {note.title}
                  </h5>
                  <p className="due-date-time">
                    Was due on {note.date} at {note.time}
                  </p>
                  <button
                    className="delete-btn"
                    onClick={() => deleteNotification("overdue", note.id)}
                  >
                    Delete
                  </button>
                </div>
              ))
            )}

            {/* XP Notifications */}
            {xpNotifications.length === 0 ? (
              <p>No XP notifications</p>
            ) : (
              xpNotifications.map((note) => (
                <div key={note.id} className="todo-card">
                  <h5 className="task-title">
                    <FontAwesomeIcon
                      icon={faTasks}
                      className="pe-2"
                      size="sm"
                    />
                    {note.title}
                  </h5>
                  <p className="due-date-time">
                    Earned on {note.date} at {note.time}
                  </p>
                  <button
                    className="delete-btn"
                    onClick={() => deleteNotification("xp", note.id)}
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Calendar Popup */}
      {isCalFloating && (
        <div className="floating-calendar-popup">
          <div className="popup-header">
            <h3>Calendar</h3>
            <button onClick={toggleCalFloating} className="close-btn"></button>
          </div>
          <div className="calendar-body d-flex">
            <div className="calendar-monthly">
              <Calendar
                onClickDay={(value: Date) => {
                  setSelectedDate(value);
                  fetchTasksForSelectedDate(value);
                }}
                value={selectedDate}
                tileClassName={tileClassName}
              />
              <h4>Schedule</h4>
              {tasksForSelectedDate.length > 0 ? (
                <div className="Sched-list">
                  {tasksForSelectedDate.map((task, index) => (
                    <div key={index} className="Sched-card">
                      <h5 className="Sched-title">
                        <FontAwesomeIcon
                          icon={faTasks}
                          className="pe-2"
                          size="sm"
                        />
                        {task.title}
                      </h5>
                      <p className="due-date-time">
                        {format(task.dueDate, "MMMM d, yyyy")} at{" "}
                        {format(task.dueDate, "hh:mm a")}
                      </p>
                      {task.description && (
                        <p className="task-description">"{task.description}"</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p>You're free today!</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
