import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { supabase } from "../supabase";
import { Button, Form } from "react-bootstrap";
import "./Profile.css";

interface FormData {
  name: string;
  email: string;
  gender: string;
  birthday: string;
  occupation: string;
  createdAt: string;
  profilePicture: File | null;
  profilePictureUrl: string;
}

const achievementsList = [
  { id: "first_login", name: "First Login", description: "Logged in for the first time." },
  { id: "task_tamer", name: "Task Tamer", description: "Complete your first task." },
  { id: "on_a_roll", name: "On a Roll", description: "Complete 5 tasks in a day." },
  { id: "daily_streak", name: "Daily Streak", description: "Complete tasks 3 days in a row." },
  { id: "master_of_lists", name: "Master of Lists", description: "Complete 100 total tasks." },
  { id: "inbox_zero", name: "Inbox Zero", description: "Finish all tasks for the day." },
  { id: "first_sprint", name: "First Sprint", description: "Complete 1 Pomodoro session." },
  { id: "deep_focus", name: "Deep Focus", description: "Complete 4 Pomodoros in a day." },
  { id: "zen_mode", name: "Zen Mode", description: "Complete a 25-minute session without pausing." },
  { id: "time_bender", name: "Time Bender", description: "Accumulate 10 hours of Pomodoro time." },
  { id: "consistent_clocker", name: "Consistent Clocker", description: "Use the Pomodoro timer 7 days in a row." },
  { id: "card_collector", name: "Card Collector", description: "Create your first deck." },
  { id: "brain_boost", name: "Brain Boost", description: "Review a full flashcard deck." },
  { id: "memory_master", name: "Memory Master", description: "Get 100% correct in a review session." },
  { id: "study_streak", name: "Study Streak", description: "Study flashcards 5 days in a row." },
  { id: "deck_dominator", name: "Deck Dominator", description: "Review 10 unique decks." },
  { id: "productivity_prodigy", name: "Productivity Prodigy", description: "Complete a task, a Pomodoro session, and review a flashcard deck in one day." },
  { id: "balance_bringer", name: "Balance Bringer", description: "Use all three features for 7 days straight." },
  { id: "power_user", name: "Power User", description: "Use all features 100 times total." },
  { id: "task_master", name: "Task Master", description: "Completed 10 tasks." },
  { id: "flashcard_novice", name: "Flashcard Novice", description: "Completed your first flashcard quiz." },
  { id: "xp_100", name: "Xp 100+", description: "Earned 100 XP." },
];

const titlesList = [
  { id: "first_login", name: "Newcomer" },
  { id: "task_tamer", name: "Task Tamer" },
  { id: "on_a_roll", name: "On a Roll" },
  { id: "daily_streak", name: "Daily Streaker" },
  { id: "master_of_lists", name: "List Master" },
  { id: "inbox_zero", name: "Inbox Zero Hero" },
  { id: "first_sprint", name: "Sprinter" },
  { id: "deep_focus", name: "Deep Focuser" },
  { id: "zen_mode", name: "Zen Master" },
  { id: "time_bender", name: "Time Bender" },
  { id: "consistent_clocker", name: "Consistent Clocker" },
  { id: "card_collector", name: "Card Collector" },
  { id: "brain_boost", name: "Brain Booster" },
  { id: "memory_master", name: "Memory Master" },
  { id: "study_streak", name: "Study Streaker" },
  { id: "deck_dominator", name: "Deck Dominator" },
  { id: "productivity_prodigy", name: "Productivity Prodigy" },
  { id: "balance_bringer", name: "Balance Bringer" },
  { id: "power_user", name: "Power User" },
  { id: "task_master", name: "Task Master" },
  { id: "flashcard_novice", name: "Flashcard Novice" },
  { id: "xp_100", name: "XP Farmer" },
];

const Profile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    gender: "",
    birthday: "",
    occupation: "",
    createdAt: "",
    profilePicture: null,
    profilePictureUrl: "",
  });

  const [loading, setLoading] = useState(true);
  const [userAchievements, setUserAchievements] = useState<string[]>([]);
  const [userTitles, setUserTitles] = useState<string[]>([]);
  const [selectedTitle, setSelectedTitle] = useState<string>("");

  const auth = getAuth();
  const db = getFirestore();

  const handleTitleSelect = async (titleId: string) => {
    if (!user) return;
    setSelectedTitle(titleId);
    const userRef = doc(db, "users", user.uid);
    try {
      await updateDoc(userRef, { selectedTitle: titleId });
    } catch (error: any) {
      alert("Error updating title: " + error.message);
    }
  };

  const checkAchievements = async (userData: any) => {
    let updatedAchievements = [...userAchievements];
    let updatedTitles = [...userTitles];

    if ((userData.tasksCompleted || 0) >= 1 && !updatedAchievements.includes("task_tamer")) {
      updatedAchievements.push("task_tamer");
    }
    if ((userData.tasksCompleted || 0) >= 1 && !updatedTitles.includes("task_tamer")) {
      updatedTitles.push("task_tamer");
    }
    if ((userData.tasksToday || 0) >= 5 && !updatedAchievements.includes("on_a_roll")) {
      updatedAchievements.push("on_a_roll");
    }
    if ((userData.tasksToday || 0) >= 5 && !updatedTitles.includes("on_a_roll")) {
      updatedTitles.push("on_a_roll");
    }
    if ((userData.taskStreak || 0) >= 3 && !updatedAchievements.includes("daily_streak")) {
      updatedAchievements.push("daily_streak");
    }
    if ((userData.taskStreak || 0) >= 3 && !updatedTitles.includes("daily_streak")) {
      updatedTitles.push("daily_streak");
    }
    if ((userData.tasksCompleted || 0) >= 100 && !updatedAchievements.includes("master_of_lists")) {
      updatedAchievements.push("master_of_lists");
    }
    if ((userData.tasksCompleted || 0) >= 100 && !updatedTitles.includes("master_of_lists")) {
      updatedTitles.push("master_of_lists");
    }
    if ((userData.tasksToday || 0) > 0 && (userData.tasksToday === userData.tasksCompletedToday) && !updatedAchievements.includes("inbox_zero")) {
      updatedAchievements.push("inbox_zero");
    }
    if ((userData.tasksToday || 0) > 0 && (userData.tasksToday === userData.tasksCompletedToday) && !updatedTitles.includes("inbox_zero")) {
      updatedTitles.push("inbox_zero");
    }
    if ((userData.pomodoroSessions || 0) >= 1 && !updatedAchievements.includes("first_sprint")) {
      updatedAchievements.push("first_sprint");
    }
    if ((userData.pomodoroSessions || 0) >= 1 && !updatedTitles.includes("first_sprint")) {
      updatedTitles.push("first_sprint");
    }
    if ((userData.pomodoroToday || 0) >= 4 && !updatedAchievements.includes("deep_focus")) {
      updatedAchievements.push("deep_focus");
    }
    if ((userData.pomodoroToday || 0) >= 4 && !updatedTitles.includes("deep_focus")) {
      updatedTitles.push("deep_focus");
    }
    if ((userData.zenSessions || 0) >= 1 && !updatedAchievements.includes("zen_mode")) {
      updatedAchievements.push("zen_mode");
    }
    if ((userData.zenSessions || 0) >= 1 && !updatedTitles.includes("zen_mode")) {
      updatedTitles.push("zen_mode");
    }
    if ((userData.pomodoroTotalMinutes || 0) >= 600 && !updatedAchievements.includes("time_bender")) {
      updatedAchievements.push("time_bender");
    }
    if ((userData.pomodoroTotalMinutes || 0) >= 600 && !updatedTitles.includes("time_bender")) {
      updatedTitles.push("time_bender");
    }
    if ((userData.pomodoroStreak || 0) >= 7 && !updatedAchievements.includes("consistent_clocker")) {
      updatedAchievements.push("consistent_clocker");
    }
    if ((userData.pomodoroStreak || 0) >= 7 && !updatedTitles.includes("consistent_clocker")) {
      updatedTitles.push("consistent_clocker");
    }
    if ((userData.decksCreated || 0) >= 1 && !updatedAchievements.includes("card_collector")) {
      updatedAchievements.push("card_collector");
    }
    if ((userData.decksCreated || 0) >= 1 && !updatedTitles.includes("card_collector")) {
      updatedTitles.push("card_collector");
    }
    if ((userData.flashcardReviews || 0) >= 1 && !updatedAchievements.includes("brain_boost")) {
      updatedAchievements.push("brain_boost");
    }
    if ((userData.flashcardReviews || 0) >= 1 && !updatedTitles.includes("brain_boost")) {
      updatedTitles.push("brain_boost");
    }
    if ((userData.flashcard100 || 0) >= 1 && !updatedAchievements.includes("memory_master")) {
      updatedAchievements.push("memory_master");
    }
    if ((userData.flashcard100 || 0) >= 1 && !updatedTitles.includes("memory_master")) {
      updatedTitles.push("memory_master");
    }
    if ((userData.flashcardStreak || 0) >= 5 && !updatedAchievements.includes("study_streak")) {
      updatedAchievements.push("study_streak");
    }
    if ((userData.flashcardStreak || 0) >= 5 && !updatedTitles.includes("study_streak")) {
      updatedTitles.push("study_streak");
    }
    if ((userData.uniqueDecksReviewed || 0) >= 10 && !updatedAchievements.includes("deck_dominator")) {
      updatedAchievements.push("deck_dominator");
    }
    if ((userData.uniqueDecksReviewed || 0) >= 10 && !updatedTitles.includes("deck_dominator")) {
      updatedTitles.push("deck_dominator");
    }
    if (userData.completedTaskToday && userData.completedPomodoroToday && userData.completedFlashcardToday && !updatedAchievements.includes("productivity_prodigy")) {
      updatedAchievements.push("productivity_prodigy");
    }
    if (userData.completedTaskToday && userData.completedPomodoroToday && userData.completedFlashcardToday && !updatedTitles.includes("productivity_prodigy")) {
      updatedTitles.push("productivity_prodigy");
    }
    if ((userData.usedAllFeaturesStreak || 0) >= 7 && !updatedAchievements.includes("balance_bringer")) {
      updatedAchievements.push("balance_bringer");
    }
    if ((userData.usedAllFeaturesStreak || 0) >= 7 && !updatedTitles.includes("balance_bringer")) {
      updatedTitles.push("balance_bringer");
    }
    if ((userData.usedAllFeaturesTotal || 0) >= 100 && !updatedAchievements.includes("power_user")) {
      updatedAchievements.push("power_user");
    }
    if ((userData.usedAllFeaturesTotal || 0) >= 100 && !updatedTitles.includes("power_user")) {
      updatedTitles.push("power_user");
    }
    if ((userData.tasksCompleted || 0) >= 10 && !updatedAchievements.includes("task_master")) {
      updatedAchievements.push("task_master");
    }
    if ((userData.tasksCompleted || 0) >= 10 && !updatedTitles.includes("task_master")) {
      updatedTitles.push("task_master");
    }
    if ((userData.flashcardReviews || 0) >= 1 && !updatedAchievements.includes("flashcard_novice")) {
      updatedAchievements.push("flashcard_novice");
    }
    if ((userData.flashcardReviews || 0) >= 1 && !updatedTitles.includes("flashcard_novice")) {
      updatedTitles.push("flashcard_novice");
    }
    if ((userData.exp || 0) >= 100 && !updatedAchievements.includes("xp_100")) {
      updatedAchievements.push("xp_100");
    }
    if ((userData.exp || 0) >= 100 && !updatedTitles.includes("xp_100")) {
      updatedTitles.push("xp_100");
    }
    if (!updatedAchievements.includes("first_login")) {
      updatedAchievements.push("first_login");
    }
    if (!updatedTitles.includes("first_login")) {
      updatedTitles.push("first_login");
    }

    let achievementsChanged = updatedAchievements.sort().join(",") !== userAchievements.sort().join(",");
    let titlesChanged = updatedTitles.sort().join(",") !== userTitles.sort().join(",");
    if (achievementsChanged || titlesChanged) {
      if (achievementsChanged) setUserAchievements(updatedAchievements);
      if (titlesChanged) setUserTitles(updatedTitles);
      if (user) {
        const userRef = doc(db, "users", user.uid);
        let updateObj: any = {};
        if (achievementsChanged) updateObj.achievements = updatedAchievements;
        if (titlesChanged) updateObj.titles = updatedTitles;
        updateDoc(userRef, updateObj);
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const userRef = doc(db, "users", firebaseUser.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData((prev) => ({
            ...prev,
            name: data.name || "",
            email: firebaseUser.email || "",
            gender: data.gender || "",
            birthday: data.birthday || "",
            occupation: data.occupation || "",
            createdAt: data.createdAt ? formatDate(data.createdAt) : "",
            profilePictureUrl: data.profilePicture || "",
          }));
          setUserAchievements(data.achievements || []);
          setUserTitles(data.titles || []);
          setSelectedTitle(data.selectedTitle || "");
          checkAchievements(data);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

 
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, files } = e.target as HTMLInputElement;
    if (files && files.length > 0) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const uploadProfilePicture = async (
    file: File,
    userId: string
  ): Promise<string> => {
    const fileExt = file.name.split(".").pop()?.toLowerCase();
    if (!["jpg", "jpeg", "webp", "png"].includes(fileExt || "")) {
      alert("Only JPG, PNG, or WebP files are allowed.");
      throw new Error("Invalid file type");
    }

    const fileName = `${userId}.${fileExt}`;
    const { error } = await supabase.storage
      .from("profile-pictures")
      .upload(fileName, file, { upsert: true });

    if (error) throw error;

    return supabase.storage.from("profile-pictures").getPublicUrl(fileName).data
      .publicUrl;
  };

  const handleSave = async () => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);

    try {
      let profilePicUrl = formData.profilePictureUrl;

      if (formData.profilePicture) {
        profilePicUrl = await uploadProfilePicture(
          formData.profilePicture,
          user.uid
        );
      }

      const updateData = {
        name: formData.name,
        gender: formData.gender,
        birthday: formData.birthday,
        occupation: formData.occupation,
        profilePicture: profilePicUrl,
      };

      await updateDoc(userRef, updateData);

      alert("Profile updated successfully.");
      setIsEditing(false);
      setFormData((prev) => ({
        ...prev,
        profilePictureUrl: profilePicUrl,
        profilePicture: null,
      }));
    } catch (error: any) {
      alert("Error updating profile: " + error.message);
    }
  };


  const formatDate = (timestamp: any) => {
    const date = timestamp.toDate();
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div id="profile-container">
      <div id="profile-header">
        <img
          id="profile-avatar"
          src={
            formData.profilePicture
              ? URL.createObjectURL(formData.profilePicture)
              : formData.profilePictureUrl || "src/assets/Default.jpg"
          }
          alt="User Avatar"
          onClick={() =>
            isEditing && document.getElementById("fileInput")?.click()
          }
        />
        <Form.Control
          type="file"
          id="fileInput"
          name="profilePicture"
          accept=".jpg,.jpeg,.webp,.png"
          onChange={handleChange}
          style={{ display: "none" }}
        />
        <div id="profile-info">
          <h2 id="Name">
            @{formData.name || "User"}
            {selectedTitle && (
              <span style={{ fontSize: "1rem", color: "#ffc107", marginLeft: 8 }}>
                [{titlesList.find((t) => t.id === selectedTitle)?.name || selectedTitle}]
              </span>
            )}
          </h2>
          <span>Joined on {formData.createdAt || "Date not available"}</span>
        </div>
        <Button
          variant="secondary text-light"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? "Cancel" : "Edit"}
        </Button>
      </div>

      <Form id="profile-form">
        <Form.Group className="mb-3">
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            disabled={!isEditing}
            maxLength={10}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control type="email" value={formData.email} disabled />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Gender</Form.Label>
          <Form.Select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            disabled={!isEditing}
          >
            <option value="Other">Other</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Birthday</Form.Label>
          <Form.Control
            type="date"
            name="birthday"
            value={formData.birthday}
            onChange={handleChange}
            disabled={!isEditing}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Occupation</Form.Label>
          <Form.Select
            name="occupation"
            value={formData.occupation}
            onChange={handleChange}
            disabled={!isEditing}
          >
            <option>Student</option>
            <option>Worker</option>
            <option>Work from Home</option>
            <option>Unemployed</option>
          </Form.Select>
        </Form.Group>

        {isEditing && (
          <Button variant="primary" onClick={handleSave}>
            Save Changes
          </Button>
        )}
      </Form>

      <div style={{ marginTop: 32, marginBottom: 32, display: "flex", gap: 48, justifyContent: "center", alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 320, maxWidth: 400 }}>
          <h3>Achievements</h3>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              overflowY: "auto",
              overflowX: "hidden",
              maxHeight: 320,
              paddingRight: 8,
            }}
          >
            {achievementsList.map((ach) => (
              <div
                key={ach.id}
                style={{
                  padding: 12,
                  borderRadius: 8,
                  border: "1px solid #eee",
                  background: userAchievements.includes(ach.id) ? "#e6ffe6" : "#f5f5f5",
                  opacity: userAchievements.includes(ach.id) ? 1 : 0.5,
                  minWidth: 180,
                  display: "block",
                }}
              >
                <strong>{ach.name}</strong>
                <div style={{ fontSize: "0.9em" }}>{ach.description}</div>
                {userAchievements.includes(ach.id) && (
                  <span style={{ color: "green", fontWeight: "bold" }}>Unlocked</span>
                )}
                {!userAchievements.includes(ach.id) && (
                  <span style={{ color: "#aaa" }}>Locked</span>
                )}
              </div>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 320, maxWidth: 400 }}>
          <h3>Titles</h3>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              overflowY: "auto",
              overflowX: "hidden",
              maxHeight: 320,
              paddingRight: 8,
            }}
          >
            {titlesList.map((title) => {
              const achievement = achievementsList.find(a => a.id === title.id);
              return (
                <div
                  key={title.id}
                  style={{
                    padding: 12,
                    borderRadius: 8,
                    border: "1px solid #eee",
                    background: userTitles.includes(title.id) ? "#e6f0ff" : "#f5f5f5",
                    opacity: userTitles.includes(title.id) ? 1 : 0.5,
                    minWidth: 180,
                    display: "block",
                    cursor: userTitles.includes(title.id) ? "pointer" : "not-allowed",
                    boxShadow:
                      selectedTitle === title.id
                        ? "0 0 0 2px #ffc107"
                        : "none",
                  }}
                  onClick={() =>
                    userTitles.includes(title.id) && handleTitleSelect(title.id)
                  }
                >
                  <strong>{title.name}</strong>
                  {achievement && (
                    <div style={{ fontSize: "0.9em", color: "#555" }}>
                      {achievement.description}
                    </div>
                  )}
                  {selectedTitle === title.id && (
                    <div style={{ color: "#ffc107", fontWeight: "bold" }}>Equipped</div>
                  )}
                  {userTitles.includes(title.id) && selectedTitle !== title.id && (
                    <div style={{ color: "green", fontWeight: "bold" }}>Unlocked</div>
                  )}
                  {!userTitles.includes(title.id) && (
                    <div style={{ color: "#aaa" }}>Locked</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
