import React, { useState } from "react";
import { Box, Button, TextField, Typography, Paper } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import config from "../config";

const AddBlogs = () => {
  const navigate = useNavigate();
  const [inputs, setInputs] = useState({
    title: "",
    desc: "",
    img: "",
  });
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleChange = (e) => {
    setInputs((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
    setError("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Just store the filename
      setInputs(prev => ({ ...prev, img: file.name }));
      // Create preview URL for display
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate inputs
    if (!inputs.title.trim() || !inputs.desc.trim() || !inputs.img) {
      setError("All fields are required");
      return;
    }

    try {
      // Create blog post with just the image filename
      const res = await axios.post(`${config.BASE_URL}/api/blogs/add`, {
        title: inputs.title,
        desc: inputs.desc,
        img: inputs.img,
        user: localStorage.getItem("userId"),
      });

      if (res.status === 200) {
        navigate("/blogs");
      }
    } catch (err) {
      console.error("Error creating blog:", err);
      setError(err.response?.data?.message || "Failed to create blog");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          maxWidth: 800,
          margin: "2rem auto",
          borderRadius: 2,
        }}
      >
        <Typography
          variant="h4"
          textAlign="center"
          fontWeight="bold"
          color="primary"
          gutterBottom
        >
          Create a New Blog
        </Typography>

        <Box
          padding={3}
          display="flex"
          flexDirection="column"
          gap={3}
        >
          <TextField
            name="title"
            onChange={handleChange}
            value={inputs.title}
            label="Title"
            variant="outlined"
            error={error && !inputs.title.trim()}
            helperText={error && !inputs.title.trim() ? "Title is required" : ""}
          />

          <TextField
            name="desc"
            onChange={handleChange}
            value={inputs.desc}
            label="Description"
            multiline
            rows={4}
            variant="outlined"
            error={error && !inputs.desc.trim()}
            helperText={error && !inputs.desc.trim() ? "Description is required" : ""}
          />

          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Choose Cover Image
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <input
                accept="image/*"
                type="file"
                onChange={handleFileChange}
                style={{ 
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  marginBottom: '10px'
                }}
              />
              <Typography variant="caption" color="text.secondary">
                Note: Please ensure your image is in the public folder
              </Typography>
            </Box>
          </Box>

          {(inputs.img || previewUrl) && (
            <Box
              sx={{
                width: '100%',
                height: 200,
                borderRadius: 2,
                overflow: 'hidden',
                bgcolor: 'background.paper'
              }}
            >
              <Box
                component="img"
                src={previewUrl || (process.env.PUBLIC_URL + '/' + inputs.img)}
                alt="Selected cover"
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </Box>
          )}

          {error && (
            <Typography color="error" textAlign="center">
              {error}
            </Typography>
          )}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{
              mt: 2,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 'bold',
            }}
          >
            Submit
          </Button>
        </Box>
      </Paper>
    </form>
  );
};

export default AddBlogs;
