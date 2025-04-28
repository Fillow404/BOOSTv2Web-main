import { useState, useEffect } from "react";
import "./SmartGoals.css";
import { FaPlus } from "react-icons/fa6";
import { FaEdit } from "react-icons/fa";
import { IoIosArrowBack } from "react-icons/io";
import { Save } from "lucide-react";
import { MdDelete } from "react-icons/md";
import { db } from "../firebase"; // Firestore
import { doc, setDoc } from "firebase/firestore";
import { supabase } from "../supabase"; // Supabase Storage
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface SmartGoalProps {
  onBack: () => void;
}

type Goal = {
  goal: string;
  textColor: string;
  bgColor: string;
  createdAt: Date;
  completed?: boolean; // Optional property for checklist items
};

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: Goal) => void;
  onEdit: (goal: Goal) => void;
  category: string;
  goalToEdit: Goal | null;
}

function AddGoalModal({
  isOpen,
  onClose,
  onSave,
  category,
  goalToEdit,
  onEdit,
}: AddGoalModalProps) {
  const [goal, setGoal] = useState("");
  const [textColor, setTextColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [timeBoundDate, setTimeBoundDate] = useState<Date | null>(null);

  useEffect(() => {
    if (goalToEdit) {
      setGoal(goalToEdit.goal);
      setTextColor(goalToEdit.textColor);
      setBgColor(goalToEdit.bgColor);
      if (category === "timeBound" && goalToEdit.createdAt) {
        setTimeBoundDate(new Date(goalToEdit.createdAt));
      }
    } else {
      setGoal("");
      setTextColor("#000000");
      setBgColor("#ffffff");
      setTimeBoundDate(null);
    }
  }, [goalToEdit, isOpen, category]);

  if (!isOpen) return null;

  const handleSave = () => {
    const goalData: Goal = {
      goal,
      textColor,
      bgColor,
      createdAt:
        category === "timeBound" && timeBoundDate ? timeBoundDate : new Date(),
    };
    if (goalToEdit) {
      onEdit(goalData);
    } else {
      onSave(goalData);
    }
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content bg-light">
        <h2>{goalToEdit ? "Edit Goal" : "Add Goal"}</h2> {/* Updated title */}
        <label>
          Goal:
          <input
            type="text"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            disabled={category === "timeBound"} // Disable input for timeBound
          />
        </label>
        <label>
          Text Color:
          <input
            type="color"
            value={textColor}
            onChange={(e) => setTextColor(e.target.value)}
          />
        </label>
        <label>
          Background Color:
          <input
            type="color"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
          />
        </label>
        {category === "timeBound" && (
          <label>
            Time Bound Date:
            <DatePicker
              selected={timeBoundDate}
              onChange={(date) => setTimeBoundDate(date)}
              showTimeSelect
              dateFormat="Pp"
            />
          </label>
        )}
        <div className="modal-buttons">
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          <button className="btn" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

interface SaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  isSaving?: boolean;
}

function SaveModal({ isOpen, onClose, onSave, isSaving }: SaveModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content bg-light">
        <h2>Save SMART Goals</h2>
        <div className="modal-buttons">
          <button className="btn" onClick={onSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Now"}
          </button>
          <button className="btn" onClick={onClose} disabled={isSaving}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SmartGoals({ onBack }: SmartGoalProps) {
  const [goals, setGoals] = useState<Record<string, Goal[]>>({
    specific: [],
    measurable: [],
    achievable: [],
    relevant: [],
    timeBound: [],
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState("");
  const [goalToEdit, setGoalToEdit] = useState<Goal | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const openModal = (category: string, goal: Goal | null = null) => {
    setCurrentCategory(category);
    setGoalToEdit(goal);
    setModalOpen(true);
  };

  const addGoal = (category: string, newGoal: Goal) => {
    setGoals((prev) => ({
      ...prev,
      [category]: [...prev[category], newGoal],
    }));
    autoSave();
  };

  const editGoal = (category: string, updatedGoal: Goal) => {
    setGoals((prev) => ({
      ...prev,
      [category]: prev[category].map((g) =>
        g === goalToEdit ? updatedGoal : g
      ),
    }));
    setGoalToEdit(null);
    autoSave();
  };

  const deleteGoal = (category: string, goalToDelete: Goal) => {
    setGoals((prev) => ({
      ...prev,
      [category]: prev[category].filter((g) => g !== goalToDelete),
    }));
    autoSave();
  };

  const saveGoalsToFirestore = async () => {
    const userDoc = doc(db, "smartGoals", "userGoals");
    await setDoc(userDoc, { goals });
    console.log("Saved to Firestore");
  };

  const saveGoalsToSupabaseStorage = async () => {
    const goalsBlob = new Blob([JSON.stringify(goals)], {
      type: "application/json",
    });
    const fileName = `smart-goals-backup-${Date.now()}.json`;

    const { data, error } = await supabase.storage
      .from("smart-goals-backups")
      .upload(fileName, goalsBlob, { contentType: "application/json" });

    if (error) {
      console.error("Supabase upload error:", error.message);
      throw new Error(error.message);
    } else {
      console.log("Backup uploaded to Supabase Storage:", data?.path);
    }
  };

  const autoSave = async () => {
    try {
      await saveGoalsToFirestore();
      await saveGoalsToSupabaseStorage();
    } catch (error) {
      console.error("Auto-save error:", error);
      throw error;
    }
  };

  return (
    <>
      <div className="smart-goals-container">
        <div className="flex-header">
          <IoIosArrowBack
            className="back-btn text-black"
            size={30}
            onClick={onBack}
          />
          <span className="title">SMART goals</span>
          <Save
            className="save text-black"
            size={30}
            onClick={() => setShowSaveModal(true)}
          />
        </div>

        {["specific", "measurable", "achievable", "relevant", "timeBound"].map(
          (category) => (
            <div key={category} className={`goal ${category}`}>
              <button
                className="plus-btn"
                id={category}
                onClick={() => openModal(category)}
              >
                <FaPlus size={20} />
              </button>
              <span>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </span>
              <div className="goal-list">
                {category === "relevant"
                  ? goals[category].map((goal, index) => (
                      <div key={index} className="goal-item checklist-item">
                        <input
                          type="checkbox"
                          id={`relevant-goal-${index}`}
                          defaultChecked={goal.completed || false}
                          onChange={(e) => {
                            const updatedGoals = [...goals[category]];
                            updatedGoals[index] = {
                              ...goal,
                              completed: e.target.checked,
                            };
                            setGoals((prev) => ({
                              ...prev,
                              [category]: updatedGoals,
                            }));
                          }}
                        />
                        <label htmlFor={`relevant-goal-${index}`}>
                          {goal.goal}
                        </label>
                      </div>
                    ))
                  : goals[category].map((goal, index) => (
                      <div
                        key={index}
                        className="goal-item"
                        style={{
                          color: goal.textColor,
                          backgroundColor: goal.bgColor,
                        }}
                      >
                        <div>{goal.goal}</div>
                        {category === "timeBound" && (
                          <div className="time-bound-date">
                            {new Date(goal.createdAt).toLocaleString()}
                          </div>
                        )}
                        <FaEdit
                          className="edit-icon"
                          size={20}
                          onClick={() => openModal(category, goal)}
                        />
                        <MdDelete
                          className="delete-icon"
                          size={20}
                          onClick={() => deleteGoal(category, goal)}
                        />
                      </div>
                    ))}
              </div>
            </div>
          )
        )}
      </div>

      <AddGoalModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={(newGoal) => addGoal(currentCategory, newGoal)}
        onEdit={(updatedGoal) => editGoal(currentCategory, updatedGoal)}
        category={currentCategory}
        goalToEdit={goalToEdit}
      />

      <SaveModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={async () => {
          try {
            setIsSaving(true);
            await autoSave();
            setShowSaveModal(false);
          } catch (error) {
            alert("Failed to save SMART goals. Please try again.");
          } finally {
            setIsSaving(false);
          }
        }}
        isSaving={isSaving}
      />
    </>
  );
}
