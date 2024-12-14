import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase"; 
import { doc, getDoc, updateDoc } from "firebase/firestore";
import axios from "axios";
import { getAuth, updateProfile } from "firebase/auth";
import FloatingLogoutButton from "./FloatingLogoutButton";
import BackButton from "./BackButton";

const CLOUDINARY_UPLOAD_URL = "https://api.cloudinary.com/v1_1/geetaanjalishah/image/upload";
const CLOUDINARY_UPLOAD_PRESET = "userimg";

const EditProfile = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    coverImage: null,
    profileImage: null,
    name: "",
    bio: "",
  });
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [loading, setLoading] = useState(true);

  const auth = getAuth();
  const userId = auth.currentUser?.uid; 

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) {
        console.error("No user is logged in.");
        return;
      }

      try {
        const userRef = doc(db, "users", userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          setUserData(userDoc.data());
        } else {
          // Set empty fields for first-time visitors
          setUserData({
            coverImage: null,
            profileImage: null,
            name: "",
            bio: "",
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  const updateFirestore = async (updates) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, updates);
  
      if (updates.name || updates.profileImage) {
        await updateProfile(auth.currentUser, {
          displayName: updates.name || auth.currentUser.displayName,
          photoURL: updates.profileImage || auth.currentUser.photoURL,
        });
      }
  
      setUserData((prev) => ({ ...prev, ...updates }));
      console.log("Firestore and Firebase Auth updated successfully.");
    } catch (error) {
      console.error("Error updating Firestore or Firebase Auth:", error);
    }
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      const response = await axios.post(CLOUDINARY_UPLOAD_URL, formData);
      return response.data.secure_url;
    } catch (error) {
      console.error("Error uploading image to Cloudinary:", error);
      return null;
    }
  };

  const handleImageChange = async (e, imageType) => {
    const file = e.target.files[0];
    if (file) {
      const url = await uploadToCloudinary(file);
      if (url) {
        await updateFirestore({ [imageType]: url });
      }
    }
  };

  const handleNameSave = async (e) => {
    if (e.type === "blur" || e.key === "Enter") {
      setIsEditingName(false);
      await updateFirestore({ name: userData.name });
    }
  };

  const handleBioSave = async (e) => {
    if (e.type === "blur" || e.key === "Enter") {
      setIsEditingBio(false);
      await updateFirestore({ bio: userData.bio });
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="edit-profile">
      <div>
        <FloatingLogoutButton />
      </div>
      <div>
        <BackButton />
      </div>
      {/* Cover Image */}
      <div className="cover">
        {userData.coverImage ? (
          <img src={userData.coverImage} alt="Cover" className="cover-image" />
        ) : (
          <p>No Cover Image</p>
        )}
        <label htmlFor="cover-image" className="edit-btn">
          <img 
            src="https://static-00.iconduck.com/assets.00/pencil-emoji-2048x2048-e4u035dk.png"
            alt="Edit" className="icon-btn-1" />
        </label>
        <input
          type="file"
          id="cover-image"
          onChange={(e) => handleImageChange(e, "coverImage")}
          style={{ display: "none" }}
        />
      </div>

      {/* Profile Image */}
      <div className="profile-info">
        {userData.profileImage ? (
          <img src={userData.profileImage} alt="Profile" className="profile-icon" />
        ) : (
          <p>No Profile Image</p>
        )}
        <label htmlFor="profile-image" className="edit-btn">
          <img
            src="https://static-00.iconduck.com/assets.00/pencil-emoji-2048x2048-e4u035dk.png"
            alt="Edit"
            className="icon-btn-2"
          />
        </label>
        <input
          type="file"
          id="profile-image"
          onChange={(e) => handleImageChange(e, "profileImage")}
          style={{ display: "none" }}
        />
      </div>

      {/* Name */}
      <div className="name-editprofile" aria-placeholder="Name">
        {isEditingName ? (
          <input
            type="text"
            value={userData.name}
            onChange={(e) => setUserData({ ...userData, name: e.target.value })}
            onBlur={handleNameSave}
            onKeyDown={handleNameSave}
            autoFocus
          />
        ) : (
          <h1>{userData.name || "Enter your name"}</h1> 
        )}
        <button className="edit-btn" onClick={() => setIsEditingName(true)}>
          <img
            src="https://static-00.iconduck.com/assets.00/pencil-emoji-2048x2048-e4u035dk.png"
            alt="Edit"
            className="icon-btn-3"
          />
        </button>
      </div>

      {/* Bio */}
      <div className="bio" aria-placeholder="Bio">
        {isEditingBio ? (
          <input
            type="text"
            value={userData.bio}
            onChange={(e) => setUserData({ ...userData, bio: e.target.value })}
            onBlur={handleBioSave}
            onKeyDown={handleBioSave}
            autoFocus
          />
        ) : (
          <p>{userData.bio || "Enter your bio"}</p> 
        )}
        <button className="edit-btn" onClick={() => setIsEditingBio(true)}>
          <img
            src="https://static-00.iconduck.com/assets.00/pencil-emoji-2048x2048-e4u035dk.png"
            alt="Edit"
            className="icon-btn-4"
          />
        </button>
      </div>

      {/* Save Changes Button */}
      <button onClick={() => navigate("/profile")} className="save-btn">
        Save Changes
      </button>
    </div>
  );
};

export default EditProfile;
