import { BrowserRouter as Router, Route,Routes } from "react-router-dom";
import { addDoc, collection, getFirestore } from "firebase/firestore";
import { app } from "./firebase";
import './App.css';
import { Signin } from "./components/Signin";
import Home from "./components/Homepage";
import Profile from "./components/Profile";
import EditProfile from "./components/EditProfile";
import CreatePost from "./components/CreatePost";
import FloatingLogoutButton from "./components/FloatingLogoutButton";

const firestore = getFirestore(app);

function App() {
  const writeData = async (user) => {
    try {
      await addDoc(collection(firestore, "users"), {
        name: user.displayName,
        email: user.email,
        profile: user.profile,
        createdAt: new Date(),
      });
      console.log("User data saved to Firestore!");
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  return (
    // <div className="App">
      // <Signin onSignIn={writeData} />
    // </div>
    <Router>
      <Routes>
        <Route path="/" element={      <Signin onSignIn={writeData} />      } />
        <Route path="/home" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/editProfile" element={<EditProfile />} />
        <Route path="/create-post" element={<CreatePost />} />
      </Routes>
    </Router>
  );
}

export default App;
