import React from "react";
import { useNavigate } from "react-router-dom";

const BackButton = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1); // Takes the user to the previous page
  };

  return (
    <button
      onClick={handleBack}
      style={{
        position: "fixed",
        top: "10px",
        left: "10px",
        padding: "10px",
        borderRadius: "50%",
        backgroundColor: "white",
        border: "none",
        color: "black",
        cursor: "pointer",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
        zIndex: 1000,
        transform: "rotate(180deg)",
      }}
      title="Go Back"
    >
    ➤ {/* Unicode arrow left */}
    </button>
  );
};

export default BackButton;
