import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { ref, uploadBytes, getDownloadURL, } from "firebase/storage";
import {
  setDoc,
  doc,
  collection,
  onSnapshot,
  getDoc,
  addDoc,
  query, where
} from "firebase/firestore";
import { storage, db } from "../firebase";
import axios from "axios"; // Import axios for Cloudinary API calls
import FloatingButton from "./FloatingButton";
import FloatingLogoutButton from "./FloatingLogoutButton";
import BackButton from "./BackButton";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profileImg, setProfileImg] = useState(null);
  const [coverImg, setCoverImg] = useState(null);
  const [intro, setIntro] = useState("");
  const [gallery, setGallery] = useState([]);
  const [posts, setPosts] = useState([]);
  const [textPost, setTextPost] = useState("");
  const [files, setFiles] = useState([]);
  const [bio, setBio] = useState(""); // Define bio state

  useEffect(() => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (currentUser) {
      setUser(currentUser);
      fetchUserData(currentUser.uid);
      const unsubscribe = fetchGalleryImages(currentUser.uid);
      fetchUserPosts(currentUser.uid);
      return () => unsubscribe(); // Clean up Firestore listener on unmount
    } else {
      navigate("/"); // Redirect if not authenticated
    }
  }, [navigate]);

  // Fetch user data (cover image, profile image, intro)
  const fetchUserData = async (uid) => {
    try {
      const userDoc = doc(db, "users", uid);
      const snapshot = await getDoc(userDoc);
      if (snapshot.exists()) {
        const data = snapshot.data();
        setCoverImg(data.coverImage || null);
        setProfileImg(data.profileImage || null);
        setBio(data.bio || "No bio available."); // Set bio
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  // Fetch gallery images
  const fetchGalleryImages = (uid) => {
    const imagesRef = collection(db, `users/${uid}/gallery`);
    return onSnapshot(
      imagesRef,
      (snapshot) => {
        const images = snapshot.docs.map((doc) => doc.data().url);
        console.log("Gallery images:", images);
        setGallery(images);
      },
      (error) => {
        console.error("Error fetching gallery images:", error);
      }
    );
  };

  // Fetch user posts
  const fetchUserPosts = (uid) => {
    const postsRef = collection(db, "posts");
    const q = query(postsRef, where("userId", "==", uid)); // Filter posts by userId
    
    return onSnapshot(
      q,
      (snapshot) => {
        const userPosts = snapshot.docs.map(async (postDoc) => {
          const postData = postDoc.data();
          const userId = postData.userId;
  
          if (!userId) {
            console.error("User UID is missing for post:", postData);
            return postData;
          }
  
          // Fetch user profile details using userId
          const userDocRef = doc(db, "users", userId);
          try {
            const userDoc = await getDoc(userDocRef);
            const userData = userDoc.exists() ? userDoc.data() : {};
  
            postData.userName = userData.displayName || "Anonymous User";
            postData.userProfile = userData.profileImage || "defaultProfileImageURL"; // Adjust if needed
          } catch (error) {
            console.error("Error fetching user data:", error);
          }
  
          return postData;
        });
  
        // Use Promise.all to ensure all post data is processed before setting state
        Promise.all(userPosts).then(postsWithUserDetails => {
          setPosts(postsWithUserDetails); // Set the filtered posts
        });
      },
      (error) => {
        console.error("Error fetching posts:", error);
      }
    );
  };
  
  

  // Example of updating bio in Firestore
  const updateBio = async (newBio, uid) => {
    try {
      const userDoc = doc(db, "users", uid);
      await setDoc(userDoc, { bio: newBio }, { merge: true }); // Merge ensures other fields are not overwritten
    } catch (error) {
      console.error("Error updating bio:", error);
    }
  };

  // Handle file input for post (multi-file)
  const handleFileChange = (e) => {
    setFiles(e.target.files);
  };

  return (
    <div className="profile">
    <div>
    <FloatingLogoutButton />
    </div>
    <div>
    <BackButton /></div>
      {/* Cover Image */}
      <div className="cover">
        {coverImg ? (
          <img src={coverImg} alt="Cover" className="cover-image" />
        ) : (
          <p>No Cover Image</p>
        )}
      </div>

      {/* Profile Info */}
      <div className="profile-info">
        {profileImg ? (
          <img src={profileImg} alt="Profile" className="profile-icon" />
        ) : (
          <p>No Profile Image</p>
        )}
        <div className="profile-details">
          <h3>{user ? user.displayName : "Loading..."}</h3>
          <h5>{bio}</h5>
        </div>
        <button
          onClick={() => navigate("/editprofile")}
          className="edit-profile-btn"
        >
          ✎ Edit Profile
        </button>
      </div>

      {/* Feed Section */}
      <h2 className="start-align mypost">My Posts</h2>
      <div className="my-feed container f">
        {posts.length > 0 ? (
          <div className="row">
            {posts.map((post, index) => (
              <div key={index} className="col s12 m6">
                {post.images.length > 0 && (
                  <div className="post-images">
                    {post.images.map((img, imgIndex) => (
                      <img
                        key={imgIndex}
                        src={img}
                        alt={`Post image ${imgIndex}`}
                        className="post-image responsive-img"
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="center-align">No images yet!</p>
        )}
      </div>
      <div className="plus-btn">
        <FloatingButton />
      </div>
    </div>
  );
};

export default Profile;
