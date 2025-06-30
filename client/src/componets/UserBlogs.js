/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import axios from "axios";
import Blog from "./Blog";
import { Container, Grid, Typography, Box, CircularProgress } from "@mui/material";
import { useSelector } from "react-redux";
import config from "../config";

const UserBlogs = () => {
  const [blogs, setBlogs] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const id = localStorage.getItem("userId");
  const searchTerm = useSelector((state) => state.search.searchTerm);

  const sendRequest = async () => {
    try {
      const res = await axios.get(`${config.BASE_URL}/api/blogs/user/${id}`);
      return res.data;
    } catch (err) {
      throw new Error(err.message || 'Failed to fetch your blogs');
    }
  };

  useEffect(() => {
    if (!id) {
      setError("Please log in to view your blogs");
      setLoading(false);
      return;
    }

    sendRequest()
      .then((data) => {
        if (data && data.user) {
          setUserData(data.user);
          setBlogs(data.user.blogs);
        } else {
          setBlogs([]);
        }
      })
      .catch(err => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  // Filter blogs based on search term
  const filteredBlogs = blogs?.filter(blog => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      blog.title.toLowerCase().includes(searchLower) ||
      blog.desc.toLowerCase().includes(searchLower)
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

  if (!blogs) {
    return (
      <Container>
        <Typography variant="h5" textAlign="center" color="text.secondary">
          Loading your blogs...
        </Typography>
      </Container>
    );
  }

  if (filteredBlogs?.length === 0) {
    return (
      <Container>
        <Typography variant="h5" textAlign="center" color="text.secondary">
          {searchTerm ? "No blogs found matching your search" : "You haven't created any blogs yet"}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" textAlign="center" mb={4} className="font-roboto">
        Your Blogs
      </Typography>
      <Grid container spacing={3}>
        {filteredBlogs.map((blog) => (
          <Blog
            key={blog._id}
              id={blog._id}
              title={blog.title}
            desc={blog.desc}
            img={blog.img}
            user={userData.name}
            userImage={userData.profileImage}
            date={blog.date}
            />
        ))}
      </Grid>
    </Container>
  );
};

export default UserBlogs;
