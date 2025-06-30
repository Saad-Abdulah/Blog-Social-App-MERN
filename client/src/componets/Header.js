import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { authActions, setDarkmode, searchActions } from "../store";
import {
  AppBar,
  Typography,
  Toolbar,
  Box,
  Button,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import SearchIcon from "@mui/icons-material/Search";
import { lightTheme, darkTheme } from "../utils/theme";

const Header = () => {
  const dispatch = useDispatch();
  const isDark = useSelector((state) => state.theme.isDarkmode);
  const theme = isDark ? darkTheme : lightTheme;
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const searchTerm = useSelector((state) => state.search.searchTerm);

  const [value, setValue] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const savedTab = localStorage.getItem("selectedTab");
    const savedTheme = localStorage.getItem("isDarkMode");
    if (savedTab !== null) {
      setValue(parseInt(savedTab, 10));
    }
    if (savedTheme !== null) {
      dispatch(setDarkmode(JSON.parse(savedTheme))); 
    }
  }, [dispatch]);

  useEffect(() => {
    const path = location.pathname;
    if (path === "/blogs/add") {
      setValue(2);
    } else if (path === "/myBlogs") {
      setValue(1);
    } else if (path === "/blogs" || path === "/") {
      setValue(0); 
    }
  }, [location.pathname]);

  const handleTabChange = (e, newValue) => {
    if (newValue >= 0 && newValue <= 2) {
    setValue(newValue);
    localStorage.setItem("selectedTab", newValue); 
    }
  };

  const handleDarkModeToggle = () => {
    const newTheme = !isDark;
    localStorage.setItem("isDarkMode", newTheme); 
    dispatch(setDarkmode(newTheme)); 
  }

  const handleLoginClick = () => {
    navigate("/login", { state: { isSignupButtonPressed: false } });
  };

  const handleSignupClick = () => {
    navigate("/login", { state: { isSignupButtonPressed: true } });
  };

  const handleSearch = (event) => {
    dispatch(searchActions.setSearchTerm(event.target.value));
  };

  return (
    <AppBar position="sticky" sx={{ background: `${theme.bg}` }}>
      <Toolbar>
        <Typography variant="h4">BlogsApp</Typography>
        {isLoggedIn && (
          <Box display="flex" marginLeft={"auto"} marginRight="auto">
            <Tabs
              textColor="inherit"
              value={value}
              onChange={handleTabChange}
            >
              <Tab LinkComponent={Link} to="/blogs" label="All Blogs" />
              <Tab LinkComponent={Link} to="/myBlogs" label="My Blogs" />
              <Tab LinkComponent={Link} to="/blogs/add" label="Add Blog" />
            </Tabs>
          </Box>
        )}
        <Box display="flex" marginLeft="auto" alignItems="center" gap={2}>
          <TextField
            size="small"
            placeholder="Search blogs..."
            value={searchTerm}
            onChange={handleSearch}
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              borderRadius: 1,
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': {
                  borderColor: 'transparent',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
              },
              '& .MuiInputBase-input::placeholder': {
                color: 'rgba(255, 255, 255, 0.7)',
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                </InputAdornment>
              ),
            }}
          />
          {!isLoggedIn && (
            <>
              <Button
                onClick={handleLoginClick}
                sx={{
                  margin: 1,
                  fontWeight: "bold",
                  color: "white",
                  borderRadius: 10,
                }}
              >
                Login
              </Button>
              <Button
                onClick={handleSignupClick}
                sx={{
                  margin: 1,
                  fontWeight: "bold",
                  color: "white",
                  borderRadius: 10,
                }}
              >
                SignUp
              </Button>
            </>
          )}

          {isLoggedIn && (
            <Button
              onClick={() => {
                dispatch(authActions.logout());
                setValue(0);
              }}
              LinkComponent={Link}
              to="/login"
              variant="contained"
              sx={{ margin: 1, borderRadius: 10 }}
              color="warning"
            >
              Logout
            </Button>
          )}
          <div
            onClick={handleDarkModeToggle}
            style={{
              alignContent: "center",
              padding: "10px 0",
              cursor: "pointer",
            }}
          >
            {isDark ? <LightModeIcon /> : <DarkModeIcon />}
          </div>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
