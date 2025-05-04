import React, { useState, useEffect } from "react";
import { RxExit } from "react-icons/rx";
import "./Flashcard-QnA.css";
import {
  getFirestore,
  doc,
  updateDoc,
  getDoc,
  collection,
  addDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { format } from "date-fns";

interface FlashcardQnAProps {
  deckTitle: string;
  cards: { id: string; question: string; answer: string }[];
  onExit: () => void;
}

export default function FlashcardQnA({
  deckTitle,
  cards,
  onExit,
}: FlashcardQnAProps) {
  const [remainingQuestions, setRemainingQuestions] = useState(cards);
  const [currentQuestion, setCurrentQuestion] = useState<{
    id: string;
    question: string;
    answer: string;
  } | null>(null);
  const [choices, setChoices] = useState<string[]>([]);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);

  useEffect(() => {
    if (remainingQuestions.length > 0) {
      const randomIndex = Math.floor(Math.random() * remainingQuestions.length);
      const question = remainingQuestions[randomIndex];
      setCurrentQuestion(question);

      const incorrectAnswers = [...cards]
        .filter((card) => card.id !== question.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map((card) => card.answer);
      const allChoices = [...incorrectAnswers, question.answer].sort(
        () => 0.5 - Math.random()
      );
      setChoices(allChoices);

      setTimeLeft(10);
    } else {
      setQuizCompleted(true);
    }
  }, [remainingQuestions]);

  useEffect(() => {
    if (timeLeft > 0 && !quizCompleted && !selectedChoice) {
      const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !selectedChoice) {
      handleNextQuestion();
    }
  }, [timeLeft, quizCompleted, selectedChoice]);

  const handleChoiceSelection = (choice: string) => {
    if (selectedChoice) return;

    setSelectedChoice(choice);

    if (choice === currentQuestion!.answer) {
      setScore((prevScore) => prevScore + 1);
    }

    setTimeout(() => {
      handleNextQuestion();
    }, 1000);
  };

  const handleNextQuestion = () => {
    setRemainingQuestions((prevQuestions) =>
      prevQuestions.filter((question) => question.id !== currentQuestion!.id)
    );
    setSelectedChoice(null);
  };

  const calculateAndStoreXP = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      console.error("User not authenticated");
      return;
    }

    const db = getFirestore();
    const userDocRef = doc(db, "users", user.uid);

    try {
      let xpEarned = 0;
      if (score === 0) {
        xpEarned = 0;
      } else if (score === cards.length) {
        xpEarned = 15;
      } else if (score / cards.length >= 0.5) {
        xpEarned = 10;
      } else {
        xpEarned = 5;
      }

      const userDocSnapshot = await getDoc(userDocRef);
      const currentXP = userDocSnapshot.exists()
        ? userDocSnapshot.data()?.exp || 0
        : 0;
      const updatedXP = currentXP + xpEarned;
      await updateDoc(userDocRef, { exp: updatedXP });
      const xpHistoryRef = collection(db, "users", user.uid, "xpHistory");
      await addDoc(xpHistoryRef, {
        xpAdded: xpEarned,
        timestamp: new Date(),
        formattedDate: format(new Date(), "MMMM d, yyyy"),
        formattedTime: format(new Date(), "hh:mm a"),
      });
      console.log(`XP Earned: ${xpEarned}, Total XP: ${updatedXP}`);
    } catch (error) {
      console.error("Error updating XP:", error);
    }
  };

  useEffect(() => {
    if (quizCompleted) {
      calculateAndStoreXP();
    }
  }, [quizCompleted]);

  if (cards.length === 0) {
    return (
      <div className="container mt-4 text-center">
        <p>No questions available.</p>
      </div>
    );
  }

  if (quizCompleted) {
    const xpEarned =
      score === 0
        ? 0
        : score === cards.length
        ? 15
        : score / cards.length >= 0.5
        ? 10
        : 5;

    let message = "";
    if (score === 0) {
      message = "Get better next time, but at least you tried!";
    } else if (score === cards.length) {
      message = "You got a perfect score! You are amazing!";
    } else {
      message = "You did great!";
    }

    return (
      <div className="container mt-4 text-center">
        <div id="bg-1" className="d-flex flex-wrap align-items-center">
          <span className="ms-4 me-2 text-white">Deck: {deckTitle}</span>
        </div>
        <div className="card m-5">
          <h3>Quiz Completed!</h3>
          <p>
            Your Score: {score}/{cards.length}
          </p>
          <p>XP Earned: {xpEarned}</p>
          <p className="fw-bold">{message}</p>
        </div>
        <button className="btn btn-warning text-white" onClick={onExit}>
          Exit Quiz
        </button>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="container mt-4 text-center">
        <p>Loading question...</p>
      </div>
    );
  }

  return (
    <React.Fragment>
      <div className="container mt-4">
        <div className="d-flex mt-4 align-items-center">
          <RxExit
            size="30"
            className="m-2 me-4"
            id="exit-btn"
            onClick={onExit}
          />
          <div
            id="bg-1"
            className="d-flex justify-content-center align-items-center flex-wrap mt-4 w-100"
          >
            <span className="mx-2 text-white">Deck: {deckTitle}</span>
            <span className="mx-2 text-white">
              Score: {score}/{cards.length}
            </span>
          </div>
        </div>

        <div className="d-flex flex-wrap align-items-center"></div>
        <div className="container">
          <div
            id="question-card"
            className="card mt-4 text-center p-3 position-relative overflow-hidden"
          >
            <div className="card-body">
              <h5 className="mb-3">{currentQuestion.question}</h5>
              <span className="fw-bold">Time Left: {timeLeft}s</span>
            </div>

            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                height: "6px",
                width: `${(timeLeft / 15) * 100}%`, // dynamic width based on time
                backgroundColor: "#ffc107",
                transition: "width 1s linear", // smooth shrinking
              }}
            />
          </div>

          <div
            id="choices-container"
            className="row justify-content-center gap-3 mt-4"
          >
            {choices.map((choice, index) => (
              <button
                key={index}
                className={`btn col-12 col-sm-5 col-md-3 text-white ${
                  selectedChoice
                    ? choice === currentQuestion.answer
                      ? "btn-success"
                      : choice === selectedChoice
                      ? "btn-danger"
                      : "btn-danger"
                    : "btn-primary"
                }`}
                id="choice-btn"
                onClick={() => handleChoiceSelection(choice)}
                disabled={!!selectedChoice}
              >
                {choice}
              </button>
            ))}
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}
