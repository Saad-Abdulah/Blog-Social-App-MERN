import React, { useEffect, useState } from "react";
import axios from "axios";
import Blog from "./Blog";
import { Container, Grid, Typography, Box, CircularProgress } from "@mui/material";
import { useSelector } from "react-redux";
import config from "../config";

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const searchTerm = useSelector((state) => state.search.searchTerm);

  const sendRequest = async () => {
    try {
      const res = await axios.get(`${config.BASE_URL}/api/blogs`);
      const data = res.data;
    return data;
    } catch (err) {
      throw new Error(err.message || 'Failed to fetch blogs');
    }
  };

  useEffect(() => {
    sendRequest()
      .then((data) => {
        setBlogs(data.blogs);
      })
      .catch(err => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Filter blogs based on search term
  const filteredBlogs = blogs.filter(blog => {
    const searchLower = searchTerm.toLowerCase();
    return (
      blog.title.toLowerCase().includes(searchLower) ||
      blog.desc.toLowerCase().includes(searchLower) ||
      blog.user.name.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error" variant="h6" align="center">
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {filteredBlogs.length === 0 ? (
        <Typography variant="h5" textAlign="center" color="text.secondary">
          {searchTerm ? "No blogs found matching your search" : "No blogs found"}
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {filteredBlogs.map((blog) => (
          <Blog
              key={blog._id}
            id={blog._id}
            isUser={localStorage.getItem("userId") === blog.user._id}
            title={blog.title}
            desc={blog.desc}
            img={blog.img}
            user={blog.user.name}
              userImage={blog.user.profileImage}
              date={blog.date}
              likes={blog.likes}
              likesCount={blog.likesCount}
              commentsCount={blog.commentsCount}
              sharesCount={blog.sharesCount}
          />
        ))}
        </Grid>
      )}
    </Container>
  );
};

export default Blogs;
