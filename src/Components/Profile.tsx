import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { supabase } from "../supabase";
import { Button, Form } from "react-bootstrap";
import "./Profile.css";

interface FormData {
  name: string;
  email: string;
  sex: string;
  birthday: string;
  occupation: string;
  createdAt: string;
  profilePicture: File | null;
  profilePictureUrl: string;
}

const Profile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    sex: "",
    birthday: "",
    occupation: "",
    createdAt: "",
    profilePicture: null,
    profilePictureUrl: "",
  });

  const [loading, setLoading] = useState(true);

  const auth = getAuth();
  const db = getFirestore();

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
            sex: data.sex || "",
            birthday: data.birthday || "",
            occupation: data.occupation || "",
            createdAt: data.createdAt ? formatDate(data.createdAt) : "",
            profilePictureUrl: data.profilePicture || "",
          }));
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
        sex: formData.sex,
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
          <h2 id="Name">@{formData.name || "User"}</h2>
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
          <Form.Label>Sex</Form.Label>
          <Form.Select
            name="sex"
            value={formData.sex}
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
    </div>
  );
};

export default Profile;
