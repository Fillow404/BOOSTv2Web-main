import React, { useState, useEffect } from "react";
import { BsSearch } from "react-icons/bs";
import SmartGoals from "./SmartGoals";
import Mindmap from "./Whiteboard";
import MindFlow from "./MindFlow";
import { db } from "../firebase"; // Adjust the import path as necessary
import { collection, getDocs } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth"; // Import Firebase Auth
import "./Brainstorming.css";

// Define the interface for a whiteboard
interface Whiteboard {
  id: string;
  filename: string;
  title: string;
  url: string;
  createdAt: string;
}

export default function Brainstorming() {
  const [activeComponent, setActiveComponent] = useState("brainstorming");
  const [whiteboards, setWhiteboards] = useState<Whiteboard[]>([]);
  const [user, setUser] = useState<firebase.User | null>(null); // Firebase user type

  useEffect(() => {
    // Set up Firebase Authentication state listener
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // Update user state when authentication state changes
    });

    // Clean up the listener when component unmounts
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      // Fetch whiteboard data for the authenticated user
      const fetchWhiteboards = async () => {
        const querySnapshot = await getDocs(
          collection(db, "users", user.uid, "whiteboards")
        );
        const whiteboardData = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          const createdAt = data.createdAt
            ? new Date(data.createdAt.seconds * 1000).toLocaleDateString()
            : "N/A";
          return {
            id: doc.id,
            filename: data.filename,
            title: data.title,
            url: data.url,
            createdAt, // formatted date or "N/A"
          };
        });
        setWhiteboards(whiteboardData);
      };

      fetchWhiteboards();
    }
  }, [user]); // Depend on user to trigger fetching whiteboards when user is set

  return (
    <React.Fragment>
      {activeComponent === "brainstorming" ? (
        <>
          <div className="row w-50 ps-5">
            <button
              className="btn col-sm-auto border rounded-5 me-2"
              id="search"
            >
              <BsSearch />
            </button>
            <input
              className="col-sm-10 rounded-5 border"
              id="searchinput"
              placeholder="Search..."
            />
          </div>
          <div className="row flex gap-4 p-4 justify-content-center">
            <div
              className="col-sm-auto card rounded-5 btn"
              id="design-btn"
              onClick={() => setActiveComponent("mindmap")}
            >
              <span>Whiteboard</span>
            </div>
            <div
              className="col-sm-auto card rounded-5 btn"
              id="design-btn"
              onClick={() => setActiveComponent("smartgoals")}
            >
              <span>Smart Goals</span>
            </div>
            <div
              className="col-sm-auto card rounded-5 btn"
              id="design-btn"
              onClick={() => setActiveComponent("mindflow")}
            >
              <span>Mind Flow</span>
            </div>

            <div className="d-flex justify-content-between align-items-center p-2 border rounded-4 bg-light">
              <span className="ps-3">Name</span>
              <span className="pe-3">Date Created</span>
            </div>

            {whiteboards.map((whiteboard) => (
              <div
                key={whiteboard.id}
                className="d-flex justify-content-between align-items-center p-2 border-bottom"
              >
                <span>{whiteboard.title}</span>
                <span>{whiteboard.createdAt}</span>
              </div>
            ))}
          </div>
        </>
      ) : activeComponent === "mindmap" ? (
        <Mindmap />
      ) : activeComponent === "smartgoals" ? (
        <SmartGoals onBack={() => setActiveComponent("brainstorming")} />
      ) : (
        <MindFlow onBack={() => setActiveComponent("brainstorming")} />
      )}
    </React.Fragment>
  );
}
