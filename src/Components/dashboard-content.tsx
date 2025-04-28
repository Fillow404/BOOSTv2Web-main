import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./dashboard-content.css";
import ExpBar from "./exp-notif-cal.tsx";
import ChatbotMascot from "../assets/Mascot.png";
import Chatbot from "./ChatBot.tsx";
import { Calendar, Clock } from "lucide-react";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
  where,
  Timestamp,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import { Dropdown } from "react-bootstrap";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface Task {
  title: string;
  description: string;
  dueDate: Date;
  priority: string;
  status: string;
}

export default function HomePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [inProgressCount, setInProgressCount] = useState(0);
  const [streakDays, setStreakDays] = useState(0);
  const [view, setView] = useState<"weekly" | "monthly">("weekly");
  const [dailyTaskCounts, setDailyTaskCounts] = useState<number[]>(
    Array(7).fill(0)
  );
  const [taskRateData, setTaskRateData] = useState<number[]>([]);
  const [userName, setUserName] = useState<string>("");
  const [productivityMessage, setProductivityMessage] = useState({
    verse: "",
    explanation: "",
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [hasBoostedToday, setHasBoostedToday] = useState(false);
  const [isChatbotVisible, setIsChatbotVisible] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      const db = getFirestore();
      const taskRef = collection(db, "users", user.uid, "todolist");
      const now = new Date();
      let startDate, endDate;

      if (view === "weekly") {
        startDate = new Date(now.setHours(0, 0, 0, 0));
        endDate = new Date(now.setHours(23, 59, 59, 999));
      } else {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          0,
          23,
          59,
          59,
          999
        );
      }

      const q = query(
        taskRef,
        where("dueDate", ">=", startDate),
        where("dueDate", "<=", endDate),
        orderBy("dueDate", "asc")
      );

      const snapshot = await getDocs(q);

      const upcoming: Task[] = [];
      let completed = 0;
      let inProgress = 0;
      let dailyCounts: number[] = Array(7).fill(0);
      const completedDates = new Set<string>();

      snapshot.forEach((doc) => {
        const data = doc.data() as Task;
        const dueDate =
          data.dueDate instanceof Timestamp
            ? data.dueDate.toDate()
            : data.dueDate;

        upcoming.push({ ...data, dueDate });

        if (data.status === "completed") {
          completed++;
          completedDates.add(dueDate.toDateString());
        } else if (data.status === "inProgress") {
          inProgress++;
        }

        if (view === "weekly") {
          const dayOfWeek = dueDate.getDay();
          dailyCounts[dayOfWeek]++;
        }
      });

      let streak = 0;
      let currentDate = new Date();
      currentDate.setDate(currentDate.getDate() - 1);

      while (completedDates.has(currentDate.toDateString())) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      }

      const taskRate: number[] = upcoming.reduce((acc, task) => {
        const dayIndex = task.dueDate.getDate() - 1;
        acc[dayIndex] = acc[dayIndex] ? acc[dayIndex] + 1 : 1;
        return acc;
      }, Array(31).fill(0));

      setTasks(upcoming);
      setCompletedCount(completed);
      setInProgressCount(inProgress);
      setDailyTaskCounts(dailyCounts);
      setTaskRateData(taskRate);
      setStreakDays(streak);
    };

    const fetchUserName = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const db = getFirestore();
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          setUserName(userDoc.data()?.name || "User");
        }
      }
    };

    const getRandomProductivityMessage = () => {
      const messages = [
        {
          verse:
            "I can do all things through Christ who strengthens me. – Philippians 4:13",
          explanation:
            "With Christ's strength, we can overcome any challenges.",
        },
        {
          verse:
            "For I know the plans I have for you, declares the Lord... – Jeremiah 29:11",
          explanation:
            "God has a good plan for our lives, filled with hope and a bright future.",
        },
        {
          verse: "The Lord is my shepherd; I shall not want. – Psalm 23:1",
          explanation:
            "God provides for all our needs and will guide us through life.",
        },
      ];
      const randomMessage =
        messages[Math.floor(Math.random() * messages.length)];
      setProductivityMessage(randomMessage);
    };

    const checkBoostStatus = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      const db = getFirestore();
      const boostDocRef = doc(db, "users", user.uid, "streak", "boost");

      const docSnap = await getDoc(boostDocRef);
      if (docSnap.exists()) {
        const lastBoostDate = docSnap.data().lastBoost?.toDate();
        const today = new Date();
        if (
          lastBoostDate &&
          lastBoostDate.toDateString() === today.toDateString()
        ) {
          setHasBoostedToday(true);
        }
      }
    };

    fetchTasks();
    fetchUserName();
    getRandomProductivityMessage();
    checkBoostStatus();

    setLoading(false);
  }, [view]);

  const handleBoost = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    const db = getFirestore();
    const boostDocRef = doc(db, "users", user.uid, "streak", "boost");

    const docSnap = await getDoc(boostDocRef);
    const today = new Date();

    if (docSnap.exists()) {
      const lastBoostDate = docSnap.data().lastBoost?.toDate();
      if (
        lastBoostDate &&
        lastBoostDate.toDateString() === today.toDateString()
      ) {
        alert("You already boosted today!");
        return;
      }
    }

    await setDoc(boostDocRef, { lastBoost: new Date() });
    setStreakDays((prev) => prev + 1);
    setHasBoostedToday(true);
    alert("Boost activated!");
  };

  const pieChartData = {
    labels: ["Completed", "In Progress"],
    datasets: [
      {
        data: [completedCount, inProgressCount],
        backgroundColor: ["green", "orange"],
        borderWidth: 1,
      },
    ],
  };

  const barChartData =
    view === "weekly"
      ? {
          labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
          datasets: [
            {
              label: "Tasks Added (Weekly)",
              data: dailyTaskCounts,
              backgroundColor: "orange",
              borderRadius: 10,
            },
          ],
        }
      : {
          labels: Array.from(
            { length: taskRateData.length },
            (_, i) => `${i + 1}`
          ),
          datasets: [
            {
              label: "Tasks Added Per Day (Monthly)",
              data: taskRateData,
              backgroundColor: "purple",
              borderRadius: 10,
            },
          ],
        };

  if (loading) return <div className="text-center">Loading...</div>;
  const handleMascotClick = () => {
    const mascotElement = document.querySelector(".mascot-container");

    if (mascotElement) {
      mascotElement.classList.add("fade-out");
      setTimeout(() => {
        setIsChatbotVisible((prev) => !prev);
        mascotElement.classList.remove("fade-out");
      }, 500);
    } else {
      setIsChatbotVisible((prev) => !prev);
    }
  };

  return (
    <div>
      <div className="pt-3">
        <ExpBar />
      </div>
      <div className="greeting-container">
        <h2 className="greeting-heading">
          {userName ? "Hello, " + userName : "Hello, kaBOOST!"}
        </h2>
        <h3 className="subheading">
          Make your day start productive and cheerful
        </h3>
        <p className="verse">{productivityMessage.verse}</p>
        <p className="explanation">{productivityMessage.explanation}</p>
      </div>
      <div className="mascot-container" onClick={handleMascotClick}>
        <img
          src={ChatbotMascot}
          alt="Chatbot Mascot"
          className="mascot-image d-flex justify-content-center"
        />
        <h6 className="text-success text-center">
          BOOMI HERE! <br />
          AI chatbot
        </h6>
      </div>

      {/* Conditionally render the Chatbot */}
      {isChatbotVisible && <Chatbot />}

      <h2 className="pt-4 mx-3">Upcoming Work</h2>
      <div className="row flex-nowrap overflow-x-auto shadow-sm p-3 bg-white rounded border-top border-bottom">
        {tasks.length > 0 ? (
          tasks.map((task, index) => (
            <div className="col-sm-auto" key={index}>
              <div
                className="card ms-3 p-3 shadow-sm"
                style={{ width: "22rem" }}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <span className="badge bg-success">Upcoming</span>
                  <button className="btn btn-light border-0">...</button>
                </div>
                <h5 className="mt-2">{task.title}</h5>
                <p className="text-muted">{task.description}</p>
                <span className="badge bg-light text-dark text-wrap">
                  {task.priority}
                </span>
                <div className="d-flex justify-content-between align-items-center mt-3 p-2 bg-light rounded">
                  <div className="d-flex align-items-center">
                    <Calendar size={16} className="me-1" />
                    {task.dueDate.toLocaleDateString()}
                  </div>
                  <div className="d-flex align-items-center">
                    <Clock size={16} className="me-1" />
                    {task.dueDate.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center" style={{ width: "100%" }}>
            <h5>You're free today!</h5>
            <p className="text-muted">No upcoming tasks scheduled.</p>
          </div>
        )}
      </div>

      <div className="d-flex justify-content-between align-items-center mt-4">
        <h2 className="mx-3">Performance Statistics</h2>
        <Dropdown>
          <Dropdown.Toggle variant="outline-success" id="dropdown-basic">
            {view.charAt(0).toUpperCase() + view.slice(1)}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => setView("weekly")}>
              Weekly
            </Dropdown.Item>
            <Dropdown.Item onClick={() => setView("monthly")}>
              Monthly
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>

      <div className="row mt-3 p-3">
        <div className="col-md-6">
          <Bar
            data={barChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: true, position: "top" } },
              elements: { bar: { borderColor: "black" } },
              scales: {
                x: { ticks: { color: "black" } },
                y: { ticks: { color: "black" } },
              },
            }}
            style={{ height: "300px", backgroundColor: "white" }}
          />
        </div>
        <div className="col-md-3 p-3">
          <h6 className="text-center">Task Completion Rate</h6>
          <Pie
            data={pieChartData}
            options={{
              responsive: true,
              plugins: { legend: { display: true, position: "top" } },
            }}
          />
        </div>
        <div className="col-md-3 d-flex flex-column align-items-center justify-content-center">
          <div className="card shadow w-100">
            <div className="card-body text-center">
              <h6 className="streak-title">
                <span className="flame-emoji">🔥</span> Streak Days
              </h6>
              <h3 className="streak-count">{streakDays}</h3>
              <button
                className="btn btn-success w-100 mt-2"
                onClick={handleBoost}
                disabled={hasBoostedToday}
              >
                {hasBoostedToday ? "Already Boosted Today" : "BOOST NOW"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
