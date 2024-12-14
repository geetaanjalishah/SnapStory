import React from "react";
import { useNavigate } from "react-router-dom";

const FloatingButton = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/create-post"); 
  };

  return (
    <button
      className="floating-btn"
      onClick={handleClick}
      aria-label="Add New Post"
    >
      +
    </button>
  );
};

export default FloatingButton;
