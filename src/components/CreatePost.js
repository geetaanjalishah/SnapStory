import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { setDoc, doc, collection, onSnapshot, getDoc, addDoc } from "firebase/firestore";
import { storage, db } from "../firebase";
import axios from "axios"; // Import axios for Cloudinary API calls
import FloatingLogoutButton from "./FloatingLogoutButton";
import BackButton from "./BackButton";

const CreatePost = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profileImg, setProfileImg] = useState(null);
  const [coverImg, setCoverImg] = useState(null);
  const [intro, setIntro] = useState("");
  const [gallery, setGallery] = useState([]);
  const [posts, setPosts] = useState([]);
  const [textPost, setTextPost] = useState("");
  const [files, setFiles] = useState([]);
  const [cameraFile, setCameraFile] = useState(null); 

  useEffect(() => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (currentUser) {
      setUser(currentUser);
      fetchUserData(currentUser.uid);
      const unsubscribe = fetchGalleryImages(currentUser.uid);
      fetchUserPosts(currentUser.uid);
      return () => unsubscribe(); 
    } else {
      navigate("/home"); 
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
        setIntro(data.intro || "No intro provided.");
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
    return onSnapshot(
      postsRef,
      (snapshot) => {
        const userPosts = snapshot.docs.map((doc) => doc.data());
        console.log("User posts:", userPosts);
        setPosts(userPosts);
      },
      (error) => {
        console.error("Error fetching posts:", error);
      }
    );
  };

  const handleFileChange = (e) => {
    setFiles(e.target.files);
  };

  const handleCameraCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCameraFile(URL.createObjectURL(file)); 
      setFiles([...files, file]); 
    }
  };

  // Upload images to Cloudinary and Firestore
  const handleUpload = async () => {
    if (files.length === 0) {
      alert("No files selected!");
      return;
    }

    // Upload all selected files to Cloudinary
    const uploadedUrls = [];
    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append("file", files[i]);
      formData.append("upload_preset", "userimg"); 

      try {
        const response = await axios.post(
          `https://api.cloudinary.com/v1_1/geetaanjalishah/image/upload`, 
          formData
        );
        const { secure_url } = response.data;
        uploadedUrls.push(secure_url);
        console.log("File uploaded successfully:", secure_url);
      } catch (error) {
        console.error("Error uploading file:", error);
        alert("Failed to upload image. Please try again.");
        return;
      }
    }

    await createPost(uploadedUrls);
  };

  const createPost = async (uploadedUrls) => {
    if (textPost.trim() === "" && uploadedUrls.length === 0) {
      alert("Post cannot be empty!");
      return;
    }

    try {
      const newPost = {
        text: textPost,
        images: uploadedUrls,
        timestamp: new Date(),
        userId: user.uid,
        username: user.displayName,
        userProfile: user.photoURL,
      };

      await addDoc(collection(db, "posts"), newPost);
      setTextPost(""); 
      setFiles([]); 
      setCameraFile(null); 
      alert("Post created successfully!");
      navigate("/");
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Failed to create post. Please try again.");
    }
  };

  return (
    <div className="create-post-container" style={styles.container}>
    <div>
    <FloatingLogoutButton />
    <div>
    <BackButton /></div>
    </div>
      <div className="create-post-header" style={styles.header}>
        <h3>Create a New Post</h3>
      </div>
      <div className="create-post-body" style={styles.body}>
        <textarea
          value={textPost}
          onChange={(e) => setTextPost(e.target.value)}
          placeholder="What's on your mind?"
          style={styles.textarea}
        />
        <input
        type="file"
        multiple
        onChange={handleFileChange}
        style={styles.fileInput}
      />
      
      <label htmlFor="camera-upload" style={styles.cameraButtonLabel}>Use Camera</label>
      <input
        type="file"
        accept="image/*"
        capture="camera"
        id="camera-upload"
        onChange={handleFileChange}
        style={styles.hiddenFileInput}
      />
      
        <button onClick={handleUpload} style={styles.button}>Post</button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    maxWidth: '800px',
    margin: 'auto',
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    marginTop: '20px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
  },
  profileImg: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  noProfileImg: {
    fontSize: '14px',
    color: '#888',
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
  },
  textarea: {
    width: '100%',
    height: '150px',
    padding: '10px',
    borderRadius: '10px',
    border: '1px solid #ddd',
    marginBottom: '10px',
    fontSize: '16px',
    resize: 'none',
  },
  fileInput: {
    marginBottom: '10px',
  },
  previewContainer: {
    marginBottom: '10px',
    display: 'flex',
    justifyContent: 'center',
  },
  previewImage: {
    maxWidth: '100%',
    height: 'auto',
    borderRadius: '10px',
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#4CAF50',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'background-color 0.3s',
  },
  
  cameraButtonLabel: {
    padding: '10px 20px',
    backgroundColor: '#4CAF50',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'background-color 0.3s',
    display: 'inline-block',
    marginBottom: '10px',
  },
  hiddenFileInput: {
    display: 'none', 
  }
};

export default CreatePost;
