import { useState, useEffect } from "react";
import "./Sidebar.css";
import { FaCrown } from "react-icons/fa";
import { BsCardText } from "react-icons/bs";
import { IoRibbon } from "react-icons/io5";
import { LayoutGrid, ListCheck, Timer, Brain, Settings } from "lucide-react";
import Brainstorming from "./Brainstorming.tsx";
import Dashboard from "./dashboard-content.tsx";
import PomodoroTimer from "./Pomodoro.tsx";
import ToDoList from "./ToDoList.tsx";
import FlashCards from "./Flashcard.tsx";
import SettingsTabs from "./Settings.tsx";
import Profile from "./Profile.tsx";
import Reward from "./Reward.tsx";
import ColabTab from "./Colab-tab.tsx";
import Logo from "../assets/BOOSTWORD.png";
import { FiMenu } from "react-icons/fi";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(window.innerWidth <= 768);
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("activeTab") || "Dashboard";
  });
  const [showProfile, setShowProfile] = useState(false);
  const [userData, setUserData] = useState<any>({
    profilePictureUrl: "",
    name: "",
  });

  const auth = getAuth();
  const db = getFirestore();

  const menuItems = [
    {
      name: "Dashboard",
      icon: <LayoutGrid size={20} />,
      component: <Dashboard />,
    },
    {
      name: "To-Do List",
      icon: <ListCheck size={20} />,
      component: <ToDoList />,
    },
    {
      name: "Pomodoro Timer",
      icon: <Timer size={20} />,
      component: <PomodoroTimer />,
    },
    {
      name: "Flash Cards",
      icon: <BsCardText size={20} />,
      component: <FlashCards />,
    },
    {
      name: "Brainstorming",
      icon: <Brain size={20} />,
      component: <Brainstorming />,
    },
    {
      name: "Rewards",
      icon: <IoRibbon size={20} />,
      component: <Reward />,
    },
    {
      name: "Settings",
      icon: <Settings size={20} />,
      component: <SettingsTabs />,
    },
    {
      name: "Premium Plan",
      icon: <FaCrown size={20} />,
      component: <ColabTab />,
    },
  ];

  useEffect(() => {
    const handleResize = () => setIsCollapsed(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    localStorage.setItem("activeTab", activeTab);
  }, [activeTab]);

  useEffect(() => {
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userRef = doc(db, "users", firebaseUser.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          const data = docSnap.data();

          const profilePicture = data.profilePicture || "";
          const name = data.name || "Username";

          setUserData({
            profilePictureUrl: profilePicture,
            name: name,
          });
        }
      }
    });
  }, [auth, db]);

  return (
    <div className="app-container">
      <div className={`sidebar ${isCollapsed ? "collapsed" : "expanded"}`}>
        <div className="logo-container m-2">
          {!isCollapsed && (
            <img src={Logo} id="logoword" className="me-4" alt="Logo" />
          )}
          <button
            onClick={() => setIsCollapsed((prev) => !prev)}
            className="collapse-button"
            aria-label="Toggle Sidebar"
          >
            <FiMenu size={20} />
          </button>
        </div>
        <hr className="m-3" />
        <ul className="menu-list">
          {menuItems.map((item) => (
            <li
              key={item.name}
              className={`menu-item ${activeTab === item.name ? "active" : ""}`}
              onClick={() => {
                setActiveTab(item.name);
                setShowProfile(false);
              }}
            >
              {item.icon}
              {!isCollapsed && <span>{item.name}</span>}
            </li>
          ))}
        </ul>

        <div className="user-section" style={{ cursor: "pointer" }}>
          <img
            src={userData.profilePictureUrl || "src/assets/Default.jpg"}
            alt="User Avatar"
            className="profile-avatar"
            onClick={() => {
              setShowProfile(true);
              setActiveTab("");
            }}
            id="user-avatar"
          />
          {!isCollapsed && (
            <>
              <span className="username px-2">
                {userData.name || "Player4"}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="content">
        {showProfile ? (
          <Profile />
        ) : (
          menuItems.map(
            (item) =>
              item.name === activeTab && (
                <div key={item.name} className="tab-content">
                  {item.component}
                </div>
              )
          )
        )}
      </div>
    </div>
  );
}
