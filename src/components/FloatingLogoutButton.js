import React from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";

const FloatingLogoutButton = () => {
  const navigate = useNavigate();
  const auth = getAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/"); 
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      style={{
        position: "fixed",
        top: "30px",
        right: "30px",
        padding: "10px 20px",
        backgroundColor: "rgba(0, 0, 0, 0.1) 0px 4px 6px",
        color: "black",
        border: "none",
        borderRadius: "25px",
        cursor: "pointer",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        zIndex: 1000,
        fontSize: "15px",
        fontWeight:"600",
        borderColor:"white"
      }}
    >
      SignOut
    </button>
  );
};

export default FloatingLogoutButton;
