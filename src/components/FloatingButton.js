import React from "react";
import { useNavigate } from "react-router-dom";

const FloatingButton = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/create-post"); // Replace with the route of your "Add New" page
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
