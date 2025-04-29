import React, { useEffect, useState, useCallback } from "react";
import {
  Excalidraw,
  serializeAsJSON,
  loadLibraryFromBlob,
  exportToSvg,
} from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";

import { supabase } from "../supabase";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import { AppState } from "@excalidraw/excalidraw/types";
import { getAuth } from "firebase/auth"; // Added authentication import


class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: any, info: any) {
    console.error("Error captured in boundary:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong.</div>;
    }
    return this.props.children;
  }
}

const ExcalidrawEditor: React.FC = () => {
  const [title, setTitle] = useState<string>("");
  const [isLoadingLibraries, setIsLoadingLibraries] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [elements, setElements] = useState<ExcalidrawElement[]>([]);
  const [appState, setAppState] = useState<AppState>({} as AppState);

  // Load Libraries
  useEffect(() => {
    const loadLibraries = async () => {
      try {
        const libPaths = [
          "/Draw/architecture-diagram-components.excalidrawlib",
        ];
        const allLibItems = await Promise.all(
          libPaths.map(async (path) => {
            const response = await fetch(path);
            if (!response.ok) {
              throw new Error(`Failed to fetch library from ${path}`);
            }
            const blob = await response.blob();
            return loadLibraryFromBlob(blob);
          })
        );

        const combinedLibrary = allLibItems.flat();
        console.log("Library loaded successfully", combinedLibrary);
      } catch (err) {
        console.error("Failed to load libraries:", err);
        setErrorMessage("Error loading diagram libraries.");
      } finally {
        setIsLoadingLibraries(false);
      }
    };

    loadLibraries();
  }, []);

  // Handle Excalidraw Changes
  const handleExcalidrawChange = useCallback(
    (newElements: readonly ExcalidrawElement[], newAppState: AppState) => {
      setElements(newElements as ExcalidrawElement[]);
      setAppState(newAppState);
    },
    []
  );

  // Save Task
  const handleSaveTask = useCallback(async () => {
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
        createdAt: serverTimestamp(),
      });

      alert("Whiteboard saved successfully!");
      setTitle("");
      setErrorMessage("");
    } catch (err) {
      console.error("Error saving task:", err);
      setErrorMessage("An error occurred while saving the whiteboard.");
    }
  }, [title, elements, appState]);

  // Export to Local (JSON)
  const handleExportJson = useCallback(() => {
    try {
      const json = serializeAsJSON(elements, appState, {}, "local");
      const blob = new Blob([json], { type: "application/json" });

      const safeTitle = title.trim() || "untitled";
      const fileName = `${safeTitle
        .replace(/\s+/g, "-")
        .toLowerCase()}-${Date.now()}.excalidraw`;

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error exporting JSON:", err);
      setErrorMessage("Error exporting the whiteboard.");
    }
  }, [title, elements, appState]);

  // Export to SVG
  const handleExportSvg = useCallback(() => {
    try {
      const svg = exportToSvg(elements);
      const blob = new Blob([svg], { type: "image/svg+xml" });

      const safeTitle = title.trim() || "untitled";
      const fileName = `${safeTitle
        .replace(/\s+/g, "-")
        .toLowerCase()}-${Date.now()}.svg`;

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error exporting SVG:", err);
      setErrorMessage("Error exporting the whiteboard.");
    }
  }, [title, elements]);

  return (
    <ErrorBoundary>
      <div className="d-flex flex-column vh-100">
        <div className="bg-light border-bottom p-2 d-flex gap-2 align-items-center">
          <input
            className="form-control"
            placeholder="Whiteboard Title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isLoadingLibraries}
          />
          <button
            className="btn btn-primary"
            onClick={handleSaveTask}
            disabled={isLoadingLibraries}
          >
            Save Task
          </button>
          <button
            className="btn btn-secondary"
            onClick={handleExportJson}
            disabled={isLoadingLibraries}
          >
            Export JSON
          </button>
          <button
            className="btn btn-secondary"
            onClick={handleExportSvg}
            disabled={isLoadingLibraries}
          >
            Export SVG
          </button>
        </div>

        {errorMessage && (
          <div className="alert alert-danger m-2 p-2">{errorMessage}</div>
        )}

        <div className="flex-grow-1 position-relative">
          <Excalidraw
            theme="light"
            UIOptions={{
              canvasActions: {
                saveToActiveFile: false,
              },
            }}
            onChange={handleExcalidrawChange}
            initialData={{
              elements,
              appState,
            }}
            name="Whiteboard Editor"
          />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default ExcalidrawEditor;
