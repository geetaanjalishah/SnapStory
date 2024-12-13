import { signInWithPopup } from "firebase/auth";
import { auth, provider, db } from "../firebase"; // Ensure db is initialized from your Firebase config
import { setDoc, doc, getDoc } from "firebase/firestore"; // Import getDoc to check if the user exists
import Cookies from "universal-cookie";
import { useNavigate } from "react-router-dom";
import React from "react";
import 'materialize-css/dist/css/materialize.min.css';
import ScrollingGallery from "./ScrollingGallery";

const cookies = new Cookies();

// SignIn Component
export const Signin = () => {
  const navigate = useNavigate();

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);

      // Check if the user already exists in Firestore
      const userRef = doc(db, "users", result.user.uid);
      const userDoc = await getDoc(userRef);

      // If the user doesn't exist, add them to the database
      if (!userDoc.exists()) {
        await setDoc(userRef, {
          uid: result.user.uid,
          displayName: result.user.displayName,
          email: result.user.email,
          profilePicture: result.user.photoURL,
          createdAt: new Date(),
        });

        console.log("User data saved successfully to Firestore!");
      } else {
        console.log("User already exists in Firestore.");
      }

      // Save the refresh token in cookies
      cookies.set("auth-token", result.user.refreshToken);

      // Navigate to the home page after data is saved or already exists
      navigate("/home");
    } catch (error) {
      console.error("Error during sign-in:", error.message);
      alert("Error signing in, please check the console for details.");
    }
  };

  return (
    <div className="main">
      <div className="carousel-container">
        <div className="carousel">
          <ScrollingGallery />
        </div>
        <div className="carousel">
          <ScrollingGallery />
        </div>
        <div className="carousel">
          <ScrollingGallery />
        </div>
      </div>
      <div className="auth">
        <div className="appname-wrapper">
          <img
            src="https://s3-alpha-sig.figma.com/img/e588/3ae0/261c0b95b3d799ea23271ef18084f911?Expires=1734912000&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=Ro97CzrY1-xXAkdAkDnEOVx0tKagq7W2ADpM15gZ1QOPtDnU29AXGYvfbDDrklbMp8DoeEgQWeqKo3jAw-IpDrI~IZCetw-42e06AiWgM7fFouaaHpyWp4CpqZ4uAtJMmgNP770y652TlCGXZrT0Ld5Gia-ZDSj2QWLgqbj9uHwPEHGK9a1ruXZ6Hz84poJRdYvh3iKmguBDCG3PONGKgdYSrK669uu8pLJqMdVmVtVqv9vnxHxRuSBelqL7m2ghelPKWDFbbdh2vBeQJS7dGwq-GMHCGXUkvEOOGi9XmZr2ZOpFPLHea0DTBbnouhtseaDC-c-6BTGuHuxaUTSHcQ__"
            alt="Vibesnap Logo"
            className="appname-logo"
          />
          <div className="appname">Vibesnap</div>
        </div>
        <p>Moments That Matter, Shared Forever.</p>
        <button className="google-button" onClick={signInWithGoogle}>
          <img
            src="https://banner2.cleanpng.com/20171216/dbb/av2e6z0my.webp"
            alt="Google Logo"
            className="google-logo"
          />
          Continue with Google
        </button>
      </div>
    </div>
  );
};
