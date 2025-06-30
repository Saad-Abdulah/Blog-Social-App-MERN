import React from "react";
import axios from "axios";
import config from "../config";
import { Button } from "@mui/material";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";

const DeleteButton = ({ blogId, onDelete }) => {
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
    try {
      await axios.delete(`${config.BASE_URL}/api/blogs/${blogId}`);
        onDelete(blogId);
    } catch (error) {
      console.error("Error deleting blog:", error);
        alert("Failed to delete blog. Please try again.");
      }
    }
  };

  return (
    <Button
      onClick={handleDelete}
      variant="contained"
      color="error"
      startIcon={<DeleteForeverIcon />}
      sx={{ mt: 2 }}
    >
      Delete
    </Button>
  );
};

export default DeleteButton;
