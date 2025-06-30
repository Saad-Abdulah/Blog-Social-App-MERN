import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  InputLabel,
} from '@mui/material';
import { FaSave } from 'react-icons/fa';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import axios from 'axios';
import config from '../config';
import { useStyles } from './utils';

const labelStyles = { mb: 1, mt: 2, fontSize: '18px', fontWeight: 'bold' };

const UpdateBlog = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inputs, setInputs] = useState({
    title: '',
    description: '',
    imagePath: ''
  });

  useEffect(() => {
    const fetchBlogDetails = async () => {
      try {
        const res = await axios.get(`${config.BASE_URL}/api/blogs/${id}`);
        const blog = res.data.blog;
        setInputs({
          title: blog.title,
          description: blog.desc,
          imagePath: blog.img
        });
      } catch (err) {
        setError(err.message || 'Failed to fetch blog details');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogDetails();
  }, [id]);

  const handleChange = (e) => {
    setInputs((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setInputs((prevState) => ({
        ...prevState,
        imagePath: file.name
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${config.BASE_URL}/api/blogs/update/${id}`, {
        title: inputs.title,
        desc: inputs.description,
        img: inputs.imagePath,
      });
      navigate(`/blog/${id}`);
    } catch (err) {
      setError(err.message || 'Failed to update blog');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Typography color="error" variant="h6" align="center" sx={{ mt: 4 }}>
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          textAlign="center"
          sx={{ mb: 4, fontWeight: 600 }}
        >
          Edit Blog Post
        </Typography>

        <form onSubmit={handleSubmit}>
          <Box>
            <InputLabel sx={labelStyles}>
              Title
            </InputLabel>
            <TextField
              name="title"
              value={inputs.title}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              required
              sx={{ mb: 3 }}
            />

            <InputLabel sx={labelStyles}>
              Description
            </InputLabel>
            <TextareaAutosize
              name="description"
              value={inputs.description}
              onChange={handleChange}
              minRows={10}
              required
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontFamily: 'inherit',
                fontSize: '16px',
                resize: 'vertical',
              }}
            />

            <InputLabel sx={{ ...labelStyles, mt: 3 }}>
              Update Image
            </InputLabel>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{
                width: '100%',
                padding: '12px 0',
                marginBottom: '20px',
              }}
            />
            {inputs.imagePath && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Current image: {inputs.imagePath}
              </Typography>
            )}

            <Button
              type="submit"
              variant="contained"
              size="large"
              startIcon={<FaSave />}
              sx={{
                mt: 3,
                borderRadius: 2,
                padding: '12px 24px',
                fontWeight: 600,
              }}
            >
              Save Changes
            </Button>
          </Box>
</form>
      </Paper>
    </Container>
  );
};

export default UpdateBlog;