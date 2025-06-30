import { Box, Button, TextField, Typography, Avatar, Container, Paper } from "@mui/material";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { authActions } from "../store";
import { useNavigate, useLocation } from "react-router-dom";
import config from "../config";

const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isSignupButtonPressed } = location.state || {};

  const [inputs, setInputs] = useState({
    name: "",
    email: "",
    password: "",
    profileImage: "",
  });

  const [isSignup, setIsSignup] = useState(isSignupButtonPressed || false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);

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
        profileImage: file.name
      }));

      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
    }
  };

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  useEffect(() => {
    setIsSignup(isSignupButtonPressed);
  }, [isSignupButtonPressed]);

  const sendRequest = async (type = "login") => {
    try {
      const res = await axios.post(`${config.BASE_URL}/api/users/${type}`, {
        name: inputs.name,
        email: inputs.email,
        password: inputs.password,
        profileImage: inputs.profileImage
      });

      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
      throw err;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await sendRequest(isSignup ? "signup" : "login");
      localStorage.setItem("userId", data.user._id);
      dispatch(authActions.login());
      navigate("/blogs");
    } catch (err) {
      console.error('Error during submission:', err);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper
        elevation={3}
        sx={{
          mt: 8,
          p: { xs: 2, sm: 3 },
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography
          component="h1"
          variant="h4"
          sx={{
            mb: 3,
            fontWeight: 600,
            color: (theme) => theme.palette.primary.main
          }}
        >
          {isSignup ? "Create Account" : "Welcome Back"}
        </Typography>

        {error && (
          <Typography color="error" variant="body2" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <Box sx={{ width: '100%' }}>
          {isSignup && (
              <>
                <TextField
                  name="name"
                  label="Full Name"
                  onChange={handleChange}
                  value={inputs.name}
                  margin="normal"
                  required
                  fullWidth
                  autoFocus
                />
                <Box
                  sx={{
                    mt: 2,
                    mb: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <Avatar
                    src={preview}
                    sx={{
                      width: 80,
                      height: 80,
                      mb: 2,
                      bgcolor: (theme) => theme.palette.primary.main
                    }}
                  >
                    {inputs.name ? inputs.name.charAt(0).toUpperCase() : '?'}
                  </Avatar>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{
                      width: '100%',
                      padding: '8px',
                    }}
                  />
                </Box>
              </>
            )}

            <TextField
              name="email"
              label="Email Address"
              type="email"
              onChange={handleChange}
              value={inputs.email}
              margin="normal"
              required
              fullWidth
              autoComplete="email"
            />

          <TextField
            name="password"
              label="Password"
              type="password"
            onChange={handleChange}
            value={inputs.password}
            margin="normal"
              required
              fullWidth
              autoComplete={isSignup ? 'new-password' : 'current-password'}
          />

          <Button
            type="submit"
              fullWidth
            variant="contained"
              size="large"
              sx={{
                mt: 3,
                mb: 2,
                borderRadius: 2,
                py: 1.5,
                fontWeight: 600,
              }}
            >
              {isSignup ? "Sign Up" : "Login"}
          </Button>

          <Button
              onClick={() => {
                setIsSignup(!isSignup);
                setError(null);
              }}
              fullWidth
              sx={{
                textTransform: 'none',
                fontWeight: 500,
              }}
          >
              {isSignup
                ? "Already have an account? Login"
                : "Don't have an account? Sign Up"}
          </Button>
        </Box>
      </form>
      </Paper>
    </Container>
  );
};

export default Login;
