import React, { useEffect, useState, useCallback } from "react";
import {
  Excalidraw,
  loadFromBlob,
  serializeAsJSON,
} from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";

import { supabase } from "../supabase";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";

import { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import { AppState } from "@excalidraw/excalidraw/types";

interface WhiteboardProps {
  fileUrl: string;
  onBack: () => void;
}

const Whiteboard: React.FC<WhiteboardProps> = ({ fileUrl, onBack }) => {
  const [title, setTitle] = useState<string>("Untitled Whiteboard");
  const [elements, setElements] = useState<ExcalidrawElement[]>([]);
  const [appState, setAppState] = useState<AppState>({} as AppState);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Load existing whiteboard from Supabase
  useEffect(() => {
    const fetchAndLoadFile = async () => {
      try {
        const response = await fetch(fileUrl);
        if (!response.ok) throw new Error("Failed to fetch file.");
        const blob = await response.blob();

        const { elements: loadedElements, appState: loadedAppState } =
          await loadFromBlob(blob, null, []);

        setElements(loadedElements as ExcalidrawElement[]);
        setAppState(loadedAppState as AppState);

        // Log view to Firestore
        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
          await addDoc(collection(db, "users", user.uid, "whiteboardViews"), {
            url: fileUrl,
            viewedAt: serverTimestamp(),
          });
        }
      } catch (error) {
        console.error("Error loading file:", error);
        setErrorMessage("Failed to load the whiteboard file.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndLoadFile();
  }, [fileUrl]);

  // Save updated whiteboard
  const handleSave = useCallback(async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        setErrorMessage("User not authenticated.");
        return;
      }

      const json = serializeAsJSON(elements, appState, {}, "database");
      const blob = new Blob([json], { type: "application/json" });

      const safeTitle = title.trim() || "untitled";
      const fileName = `${safeTitle
        .replace(/\s+/g, "-")
        .toLowerCase()}-${Date.now()}.excalidraw`;

      const { error } = await supabase.storage
        .from("whiteboards")
        .upload(fileName, blob, {
          contentType: "application/json",
          upsert: false,
        });

      if (error) {
        console.error("Supabase upload failed:", error.message);
        setErrorMessage("Upload failed. Please try again.");
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("whiteboards")
        .getPublicUrl(fileName);

      const downloadURL = publicUrlData?.publicUrl;

      await addDoc(collection(db, "users", user.uid, "whiteboards"), {
        title: safeTitle,
        url: downloadURL,
        fileName,
        createdAt: serverTimestamp(), // ✅ Firestore server time
        readableDate: new Date().toLocaleString(), // ✅ Optional: readable string
      });

      alert("Whiteboard saved successfully!");
      setTitle("");
      setErrorMessage("");
    } catch (err) {
      console.error("Error saving task:", err);
      setErrorMessage("An error occurred while saving the whiteboard.");
    }
  }, [title, elements, appState]);

  const handleExcalidrawChange = useCallback(
    (newElements: readonly ExcalidrawElement[], newAppState: AppState) => {
      setElements(newElements as ExcalidrawElement[]);
      setAppState(newAppState);
    },
    []
  );

  return (
    <div className="d-flex flex-column vh-100">
      <div className="bg-light border-bottom p-2 d-flex gap-2 align-items-center">
        <button className="btn btn-secondary" onClick={onBack}>
          Back
        </button>
        <input
          className="form-control"
          placeholder="Whiteboard Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ maxWidth: "300px" }}
        />
        <button className="btn btn-success" onClick={handleSave}>
          Save
        </button>
      </div>

      {errorMessage && (
        <div className="alert alert-danger m-2 p-2">{errorMessage}</div>
      )}

      <div className="flex-grow-1 position-relative">
        {!isLoading && (
          <Excalidraw
            theme="light"
            UIOptions={{ canvasActions: { saveToActiveFile: false } }}
            onChange={handleExcalidrawChange}
            initialData={{ elements, appState }}
            name="Whiteboard Viewer"
          />
        )}
      </div>
    </div>
  );
};

export default Whiteboard;
