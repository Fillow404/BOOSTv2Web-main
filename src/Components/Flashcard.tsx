import React, { useState, useEffect } from "react";
import "./Flashcard.css";
import "bootstrap/dist/css/bootstrap.min.css";
import FlashcardDetails from "./Flashcard-content.tsx";
import { firestore, auth } from "../firebase";
import {
  collection,
  doc,
  query,
  onSnapshot,
  addDoc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  getDocs,
} from "firebase/firestore";

type ActiveComponentState =
  | "flashcard"
  | { name: "flashcardDetails"; deckId: string; deckTitle: string; deckDescription: string };

export default function Flashcard() {
  const [user, setUser] = useState<any>(null);
  const [topics, setTopics] = useState<
    { id: string; title: string; decks: { id: string; name: string; description: string }[] }[]
  >([]);
  const [showAddDeckModal, setShowAddDeckModal] = useState(false);
  const [newDeckName, setNewDeckName] = useState("");
  const [newDeckDescription, setNewDeckDescription] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);

  const [showAddTopicModal, setShowAddTopicModal] = useState(false);
  const [newTopicName, setNewTopicName] = useState("");
  const [activeComponent, setActiveComponent] =
    useState<ActiveComponentState>("flashcard");

  const [searchQuery, setSearchQuery] = useState("");

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentTopic, setCurrentTopic] = useState<{ id: string; title: string } | null>(null);
  const [editTopicTitle, setEditTopicTitle] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (userAuth) => {
      if (userAuth) {
        setUser(userAuth);
        loadTopics(userAuth.uid);
      } else {
        setTopics([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const loadTopics = (uid: string) => {
    const topicsCollectionRef = collection(firestore, "users", uid, "flashcard");
    const q = query(topicsCollectionRef);

    const unsubscribeTopics = onSnapshot(q, async (querySnapshot) => {
      const loadedTopics: any[] = [];
      for (const doc of querySnapshot.docs) {
        const topicData = doc.data();
        const decksCollectionRef = collection(
          firestore,
          "users",
          uid,
          "flashcard",
          doc.id,
          "decks"
        );
        const decksSnapshot = await getDocs(decksCollectionRef);
        const decks = decksSnapshot.docs.map((deckDoc) => ({
          id: deckDoc.id,
          ...deckDoc.data(),
        }));
        loadedTopics.push({ id: doc.id, ...topicData, decks });
      }
      setTopics(loadedTopics);
    });

    return () => unsubscribeTopics();
  };

  const handleCreateTopic = async () => {
    if (!newTopicName.trim()) return;

    const newTopic = {
      title: newTopicName.trim(),
      createdAt: serverTimestamp(),
    };

    try {
      const topicsCollectionRef = collection(firestore, "users", user.uid, "flashcard");
      const docRef = await addDoc(topicsCollectionRef, newTopic);
      setTopics((prevTopics) => [
        ...prevTopics,
        { id: docRef.id, ...newTopic, decks: [] },
      ]);
      setNewTopicName("");
      setShowAddTopicModal(false);
    } catch (error) {
      console.error("Error creating topic:", error);
    }
  };

  const handleEditTopic = async () => {
    if (!editTopicTitle.trim() || !currentTopic) return;

    try {
      const topicDocRef = doc(firestore, "users", user.uid, "flashcard", currentTopic.id);
      await updateDoc(topicDocRef, { title: editTopicTitle.trim() });
      setShowEditModal(false);
    } catch (error) {
      console.error("Error editing topic:", error);
    }
  };

  const handleDeleteTopic = async () => {
    if (!currentTopic) return;

    try {
      const topicDocRef = doc(firestore, "users", user.uid, "flashcard", currentTopic.id);
      await deleteDoc(topicDocRef);
      setTopics((prevTopics) =>
        prevTopics.filter((topic) => topic.id !== currentTopic.id)
      );
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error deleting topic:", error);
    }
  };

  const handleCreateDeck = async () => {
    if (!newDeckName.trim() || !selectedTopicId) return;

    const newDeck = {
      name: newDeckName.trim(),
      description: newDeckDescription.trim(),
      createdAt: serverTimestamp(),
    };

    try {
      const topicDocRef = doc(firestore, "users", user.uid, "flashcard", selectedTopicId);
      const decksCollectionRef = collection(topicDocRef, "decks");
      const deckDocRef = await addDoc(decksCollectionRef, newDeck);

      setTopics((prevTopics) =>
        prevTopics.map((topic) =>
          topic.id === selectedTopicId
            ? {
                ...topic,
                decks: [...topic.decks, { id: deckDocRef.id, ...newDeck }],
              }
            : topic
        )
      );

      setNewDeckName("");
      setNewDeckDescription("");
      setShowAddDeckModal(false);
    } catch (error) {
      console.error("Error creating deck:", error);
    }
  };

  const handleDeleteDeck = async (deckId: string, topicId: string) => {
    try {
      const deckDocRef = doc(firestore, "users", user.uid, "flashcard", topicId, "decks", deckId);
      await deleteDoc(deckDocRef);

      setTopics((prevTopics) =>
        prevTopics.map((topic) =>
          topic.id === topicId
            ? {
                ...topic,
                decks: topic.decks.filter((deck) => deck.id !== deckId),
              }
            : topic
        )
      );
    } catch (error) {
      console.error("Error deleting deck:", error);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) {
      return text;
    }
    const regex = new RegExp(`(${highlight})`, "gi");
    return text.split(regex).map((part, index) =>
      part.toLowerCase() === highlight.toLowerCase() ? (
        <span key={index} className="highlight">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const filteredTopics = topics.filter((topic) =>
    topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    topic.decks.some((deck) =>
      deck.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <React.Fragment>
      {activeComponent === "flashcard" ? (
        <>
          <div className="row w-100 ps-3 pe-3">
            <input
              className="col rounded-5 border"
              id="searchinput"
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>

          {filteredTopics.map((topic) => (
            <div key={topic.id} className="mt-4">
              <div className="d-flex align-items-center justify-content-between flex-wrap">
                <h3 className="ms-3">{highlightText(topic.title, searchQuery)}</h3>
                <div className="me-3">
                  <button
                    className="btn btn-sm btn-outline-warning me-2"
                    onClick={() => {
                      setCurrentTopic(topic);
                      setEditTopicTitle(topic.title);
                      setShowEditModal(true);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => {
                      setCurrentTopic(topic);
                      setShowDeleteModal(true);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div
                id="flashcard-container"
                className="row flex-nowrap overflow-x-auto ms-1 me-1"
              >
                {topic.decks.map((deck) => (
                  <div
                    key={deck.id}
                    id="flashcard-card"
                    className="col-12 col-sm-6 col-md-4 col-lg-3 ms-3 card rounded-5 btn text-start p-3"
                    onClick={() =>
                      setActiveComponent({
                        name: "flashcardDetails",
                        deckId: deck.id,
                        deckTitle: deck.name,
                        deckDescription: deck.description,
                      })
                    }
                  >
                    <h5 id="flashcard-title" className="m-2">
                      {highlightText(deck.name, searchQuery)}
                    </h5>
                    <p
                      id="flashcard-description"
                      className="text-muted small ms-3"
                    >
                      {deck.description}
                    </p>
                  </div>
                ))}

                <button
                  className="col-12 col-sm-6 col-md-4 col-lg-3 ms-3 card rounded-5 btn d-flex align-items-center justify-content-center"
                  id="add-deck"
                  onClick={() => {
                    setSelectedTopicId(topic.id);
                    setShowAddDeckModal(true);
                  }}
                >
                  + Add Deck
                </button>
              </div>
            </div>
          ))}

          <div className="ms-3">
            <button
              className="btn ms-3 mt-4 ps-5 pe-5 rounded-5"
              id="add-topic"
              onClick={() => setShowAddTopicModal(true)}
            >
              + Add Topic
            </button>
          </div>
        </>
      ) : (
        <FlashcardDetails
          onBack={() => setActiveComponent("flashcard")}
          deckId={activeComponent.deckId}
          deckTitle={activeComponent.deckTitle}
          deckDescription={activeComponent.deckDescription}
          topicId={selectedTopicId!}
          onDeleteDeck={(deckId) => handleDeleteDeck(deckId, selectedTopicId!)}
        />
      )}

      {showEditModal && (
        <div className="modal-bg">
          <div className="modal-content bg-light p-4 rounded-5">
            <h3>Edit Topic</h3>
            <input
              type="text"
              placeholder="Edit Topic Title"
              value={editTopicTitle}
              onChange={(e) => setEditTopicTitle(e.target.value)}
              className="modal-input form-control mb-3"
            />
            <div className="modal-buttons">
              <button
                onClick={() => setShowEditModal(false)}
                className="btn btn-secondary me-2"
              >
                Cancel
              </button>
              <button onClick={handleEditTopic} className="btn btn-primary">
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="modal-bg">
          <div className="modal-content bg-light p-4 rounded-5">
            <h3>Delete Topic</h3>
            <p>Are you sure you want to delete this topic?</p>
            <div className="modal-buttons">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn btn-secondary me-2"
              >
                Cancel
              </button>
              <button onClick={handleDeleteTopic} className="btn btn-danger">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddDeckModal && (
        <div className="modal-backdrop-deck">
          <div className="modal-content p-4 rounded-5" id="card-bg">
            <h3>Create New Deck</h3>
            <p>A Deck is a set of flashcards.</p>
            <input
              type="text"
              placeholder="Deck Title (required)"
              value={newDeckName}
              onChange={(e) => setNewDeckName(e.target.value)}
              className="modal-input form-control mb-2"
            />
            <textarea
              placeholder="Deck Description"
              value={newDeckDescription}
              onChange={(e) => setNewDeckDescription(e.target.value)}
              className="modal-input form-control mb-3"
            />
            <div className="modal-buttons">
              <button
                onClick={() => setShowAddDeckModal(false)}
                className="btn btn-secondary me-2"
              >
                Cancel
              </button>
              <button onClick={handleCreateDeck} className="btn btn-primary">
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddTopicModal && (
        <div className="modal-backdrop-topic">
          <div className="modal-content p-4 rounded-5" id="card-bg">
            <h3>Create New Topic</h3>
            <p>A Topic is a set of decks.</p>
            <input
              type="text"
              placeholder="Topic Title (required)"
              value={newTopicName}
              onChange={(e) => setNewTopicName(e.target.value)}
              className="modal-input form-control mb-3"
            />
            <div className="modal-buttons">
              <button
                onClick={() => setShowAddTopicModal(false)}
                className="btn btn-secondary me-2"
              >
                Cancel
              </button>
              <button onClick={handleCreateTopic} className="btn btn-primary">
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </React.Fragment>
  );
}