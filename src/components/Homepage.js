import { useNavigate } from "react-router-dom";
import Cookies from "universal-cookie";
import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { doc, collection, query, onSnapshot, getDoc } from "firebase/firestore"; // Fixed imports
import { db } from "../firebase";
import FloatingButton from "./FloatingButton";
import Share from "./Share";
import FloatingLogoutButton from "./FloatingLogoutButton";
import BackButton from "./BackButton";

const cookies = new Cookies();

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [posts, setPosts] = useState([]);
  const [intro, setIntro] = useState(""); 

  useEffect(() => {
    const token = cookies.get("auth-token");
    if (!token) {
      navigate("/");
      return;
    }

    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (currentUser) {
      setUser({
        displayName: currentUser.displayName,
        email: currentUser.email,
        profile: currentUser.photoURL,
      });
      fetchGalleryImages(currentUser.uid);
      fetchUserPosts(currentUser.uid);
      fetchUserData(currentUser.uid); 
    }
  }, [navigate]);

  const fetchGalleryImages = (uid) => {
    const imagesRef = collection(db, `users/${uid}/gallery`);
    return onSnapshot(
      imagesRef,
      (snapshot) => {
        const images = snapshot.docs.map((doc) => doc.data().url);
        setGallery(images);
      },
      (error) => {
        console.error("Error fetching gallery images:", error);
      }
    );
  };

  const fetchUserPosts = () => {
    const postsRef = collection(db, "posts");
    const q = query(postsRef);

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

          const userDocRef = doc(db, "users", userId);
          try {
            const userDoc = await getDoc(userDocRef);
            const userData = userDoc.exists() ? userDoc.data() : {};

            postData.userName =
              userData.name || userData.displayName || "Anonymous User";
            postData.userProfile =
              userData.profileImage ||
              userData.profilePicture ||
              "defaultProfileImageURL";
          } catch (error) {
            console.error("Error fetching user data:", error);
          }

          return postData;
        });

        Promise.all(userPosts).then((postsWithUserDetails) => {
          setPosts(postsWithUserDetails); 
        });
      },
      (error) => {
        console.error("Error fetching posts:", error);
      }
    );
  };

  const fetchUserData = async (uid) => {
    try {
      const userDoc = doc(db, "users", uid);
      const snapshot = await getDoc(userDoc);
      if (snapshot.exists()) {
        const data = snapshot.data();
        setIntro(data.intro || "No intro provided.");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const goToProfile = () => {
    navigate("/profile");
  };

  const generateRandomGradient = () => {
    const getLightColor = () => {
      const r = Math.floor(Math.random() * 128) + 127; 
      const g = Math.floor(Math.random() * 128) + 127;
      const b = Math.floor(Math.random() * 128) + 127; 
      return `rgb(${r}, ${g}, ${b})`;
    };

    const color1 = getLightColor();
    const color2 = getLightColor();

    return `linear-gradient(135deg, ${color1}, ${color2})`;
  };

  return (
    <div className="home">
      <FloatingLogoutButton />
      <div>
        <BackButton />
      </div>
      {user ? (
        <>
          <div className="intro1" onClick={goToProfile}>
            <div className="flex">
              {user.profile && (
                <img src={user.profile} className="profile-img" alt="Profile" />
              )}
              <div className="greeting-container">
                <div className="greeting">Welcome Back,</div>
                <div className="name">
                  {user?.displayName || "Anonymous User"}
                </div>
              </div>
            </div>
          </div>

          {/* Feed Section */}
          <div className="feed">
            <div className="feeds">Feeds</div>

            <div className="col-12 flex">
              <div className="col-2"></div>
              <div className="col-8">
                {posts.length > 0 ? (
                  posts.map((post, index) => (
                    <div
                      key={index}
                      className="post card"
                      style={{ background: generateRandomGradient() }}
                    >
                      <div className="card-content">
                        <div className="post-header row valign-wrapper">
                          <div className="col s2">
                            {post.userProfile ? (
                              <img
                                src={post.userProfile}
                                alt="Profile"
                                className="profile-icon-1"
                              />
                            ) : (
                              <p>No Profile Image</p>
                            )}
                          </div>
                          <div className="post-info col s10">
                            <h5 className="username">
                              {post.userName || "Anonymous User"}
                            </h5>
                            <p className="#424242-text">
                              {post.timestamp
                                ? new Date(
                                    post.timestamp.seconds * 1000
                                  ).toLocaleString()
                                : "Unknown Date"}
                            </p>
                          </div>
                        </div>
                        <p className="post-text">{post.text}</p>
                        <div className="col-12 flex">
                          <div className="col-1"></div>
                          <div className="col-10 flex">
                            {post.images?.length > 0 && (
                              <div className="post-images">
                                {post.images.map((img, index) => (
                                  <img
                                    key={index}
                                    src={img}
                                    alt={`Post image ${index}`}
                                    className="post-image responsive-img"
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="col-1"></div>
                        </div>

                        <div className="share-container">
                          <Share
                            url={window.location.href}
                            title={post.title}
                            description={post.text}
                          />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No posts yet!</p>
                )}
              </div>
              <div className="col-2"></div>
            </div>
          </div>

          <div className="plus-btn">
            <FloatingButton />
          </div>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default Home;
