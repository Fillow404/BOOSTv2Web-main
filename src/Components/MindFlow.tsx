import React, { useState, useCallback } from "react";
import "./MindFlow.css";
import { IoIosArrowBack } from "react-icons/io";
import { Save } from "lucide-react";
import ReactFlow, {
  Controls,
  Background,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
} from "reactflow";
import "reactflow/dist/style.css";
import { supabase } from "../supabase"; // Import Supabase client
import { db } from "../firebase"; // Import Firebase Firestore client
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

interface MindFlowProps {
  onBack: () => void;
}

const MessageModal = ({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) => (
  <div className="message-modal">
    <div className="message-modal-content">
      <p>{message}</p>
      <button onClick={onClose} className="btn">
        Close
      </button>
    </div>
  </div>
);

export default function MindFlow({ onBack }: MindFlowProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [editNodeData, setEditNodeData] = useState({
    label: "",
    size: 40,
    color: "#000000",
    textColor: "#000000",
  });
  const [newNodeData, setNewNodeData] = useState({
    label: "",
    size: 40,
    color: "#ffffff",
    textColor: "#000000",
  });

  const [fileName, setFileName] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  const isMobile = window.innerWidth <= 768;
  const connectorStrokeWidth = isMobile ? 40 : 20;

  const addNode = () => {
    setNewNodeData({
      label: "",
      size: 40,
      color: "#ffffff",
      textColor: "#000000",
    });
    setIsAddModalOpen(true);
  };

  const handleAddSubmit = () => {
    const textLength = newNodeData.label.length;
    const nodeWidth = Math.max(100, textLength * 10);
    const nodeHeight = 50;

    const newNode: Node = {
      id: `${nodes.length + 1}`,
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: { label: newNodeData.label },
      type: "default",
      style: {
        width: nodeWidth,
        height: nodeHeight,
        backgroundColor: newNodeData.color,
        color: newNodeData.textColor,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "16px",
      },
    };
    setNodes((nds) => [...nds, newNode]);
    setIsAddModalOpen(false);
  };

  const deleteNode = () => {
    if (selectedNodeId) {
      setNodes((nds) => nds.filter((node) => node.id !== selectedNodeId));
      setEdges((eds) =>
        eds.filter(
          (edge) =>
            edge.source !== selectedNodeId && edge.target !== selectedNodeId
        )
      );
      setSelectedNodeId(null);
    } else {
      setMessage("Please select a node to delete.");
    }
  };

  const deleteEdge = () => {
    if (selectedEdgeId) {
      setEdges((eds) => eds.filter((edge) => edge.id !== selectedEdgeId));
      setSelectedEdgeId(null);
    } else {
      setMessage("Please select a line to delete.");
    }
  };

  const editNode = () => {
    if (selectedNodeId) {
      const selectedNode = nodes.find((node) => node.id === selectedNodeId);
      if (selectedNode) {
        setEditNodeData({
          label: selectedNode.data.label || "",
          size: Number(selectedNode.style?.width) || 40,
          color: selectedNode.style?.backgroundColor || "#000000",
          textColor: selectedNode.style?.color || "#000000",
        });
        setIsEditModalOpen(true);
      }
    } else {
      setMessage("Please select a node to edit.");
    }
  };

  const handleEditSubmit = () => {
    const textLength = editNodeData.label.length;
    const nodeWidth = Math.max(100, textLength * 10);
    const nodeHeight = 50;

    setNodes((nds) =>
      nds.map((node) =>
        node.id === selectedNodeId
          ? {
              ...node,
              data: { ...node.data, label: editNodeData.label },
              style: {
                ...node.style,
                width: nodeWidth,
                height: nodeHeight,
                backgroundColor: editNodeData.color,
                color: editNodeData.textColor,
                fontSize: "16px",
              },
            }
          : node
      )
    );
    setIsEditModalOpen(false);
  };

  const onNodeClick = (_event: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
    setSelectedEdgeId(null);
  };

  const onEdgeClick = (_event: React.MouseEvent, edge: Edge) => {
    setSelectedEdgeId(edge.id);
    setSelectedNodeId(null);
  };

  // Handle saving MindFlow to Supabase and Firestore under the user
  const handleSaveFile = async () => {
    if (!fileName.trim()) {
      setMessage("Please provide a file name.");
      return;
    }

    // Get current user UID
    const { data: { user } } = await supabase.auth.getUser(); // If you're using Supabase for authentication
    const userId = user?.id; // Get the user ID (UID)

    if (!userId) {
      setMessage("Please sign in to save your MindFlow.");
      return;
    }

    try {
      const fileContent = JSON.stringify({ nodes, edges }, null, 2);
      const blob = new Blob([fileContent], { type: "application/json" });
      const filePath = `mindflows/${fileName}.json`;

      // Upload the file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from("mindflow")
        .upload(filePath, blob, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        console.error(uploadError);
        setMessage("Failed to upload file to Supabase.");
        return;
      }

      // Save metadata in Firestore under the user
      await addDoc(collection(db, "users", userId, "mindflows"), {
        fileName: fileName,
        filePath: filePath,
        createdAt: serverTimestamp(),
        nodesCount: nodes.length,
        edgesCount: edges.length,
      });

      setMessage("MindFlow saved successfully!");
      setIsSaving(false);
      setFileName("");
    } catch (error) {
      console.error(error);
      setMessage("An error occurred while saving the file.");
    }
  };

  return (
    <React.Fragment>
      {/* Updated Header Section */}
      <div className="header-container d-flex align-items-center justify-content-between p-3">
        <IoIosArrowBack
          size={30}
          onClick={onBack}
          style={{ cursor: "pointer" }}
        />
        <h2 className="text-center flex-grow-1 m-0">Mind Flow</h2>
        <Save
          size={30}
          style={{ cursor: "pointer" }}
          onClick={() => setIsSaving(true)}
        />
      </div>

      <div id="flow">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          fitView
          defaultEdgeOptions={{
            style: { strokeWidth: connectorStrokeWidth },
          }}
        >
          <Controls />
          <Background />
        </ReactFlow>
      </div>

      <div
        className={`add-node-container ${
          isAddModalOpen || isEditModalOpen ? "hidden" : ""
        }`}
      >
        <button onClick={addNode} className="btn">
          Add Node
        </button>
        <button onClick={deleteNode} className="btn">
          Delete Node
        </button>
        <button onClick={editNode} className="btn">
          Edit Node
        </button>
        <button onClick={deleteEdge} className="btn">
          Delete Line
        </button>
      </div>

      {isAddModalOpen && (
        <div className="edit-modal">
          <h3>Add Node</h3>
          <label>
            Name:
            <input
              type="text"
              value={newNodeData.label}
              onChange={(e) =>
                setNewNodeData({ ...newNodeData, label: e.target.value })
              }
            />
          </label>
          <label>
            Background Color:
            <input
              type="color"
              value={newNodeData.color}
              onChange={(e) =>
                setNewNodeData({ ...newNodeData, color: e.target.value })
              }
            />
          </label>
          <label>
            Text Color:
            <input
              type="color"
              value={newNodeData.textColor}
              onChange={(e) =>
                setNewNodeData({ ...newNodeData, textColor: e.target.value })
              }
            />
          </label>
          <button onClick={handleAddSubmit} className="btn">
            Add
          </button>
          <button onClick={() => setIsAddModalOpen(false)} className="btn">
            Cancel
          </button>
        </div>
      )}

      {isEditModalOpen && (
        <div className="edit-modal">
          <h3>Edit Node</h3>
          <label>
            Name:
            <input
              type="text"
              value={editNodeData.label}
              onChange={(e) =>
                setEditNodeData({ ...editNodeData, label: e.target.value })
              }
            />
          </label>
          <label>
            Background Color:
            <input
              type="color"
              value={editNodeData.color}
              onChange={(e) =>
                setEditNodeData({ ...editNodeData, color: e.target.value })
              }
            />
          </label>
          <label>
            Text Color:
            <input
              type="color"
              value={editNodeData.textColor}
              onChange={(e) =>
                setEditNodeData({ ...editNodeData, textColor: e.target.value })
              }
            />
          </label>
          <button onClick={handleEditSubmit} className="btn">
            Save
          </button>
          <button onClick={() => setIsEditModalOpen(false)} className="btn">
            Cancel
          </button>
        </div>
      )}

      {message && (
        <MessageModal message={message} onClose={() => setMessage(null)} />
      )}

      {/* Save File Modal */}
      {isSaving && (
        <div className="edit-modal">
          <h3>Save MindFlow</h3>
          <label>
            File Name:
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Enter file name"
            />
          </label>
          <button onClick={handleSaveFile} className="btn">
            Save
          </button>
          <button onClick={() => setIsSaving(false)} className="btn">
            Cancel
          </button>
        </div>
      )}
    </React.Fragment>
  );
}
