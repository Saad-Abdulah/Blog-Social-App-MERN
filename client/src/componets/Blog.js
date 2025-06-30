import {
  Avatar,
  Card,
  CardContent,
  CardHeader,
  CardMedia,
  Typography,
  Grid,
  CardActionArea,
  IconButton,
  Box,
  Snackbar,
} from "@mui/material";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStyles } from "./utils";
import { FaHeart, FaRegHeart, FaComment, FaShare } from 'react-icons/fa';
import axios from "axios";
import config from "../config";
import defaultAvatar from '../assets/default-avatar.avif';

const Blogs = ({ title, desc, img, user, userImage, id, date, likes = [], likesCount = 0, commentsCount = 0, sharesCount = 0 }) => {
  const classes = useStyles();
  const navigate = useNavigate();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const userId = localStorage.getItem("userId");
  const [isLiked, setIsLiked] = useState(likes.includes(userId));
  const [currentLikesCount, setCurrentLikesCount] = useState(likesCount);

  const getProfileImage = (userImage) => {
    if (!userImage) {
      return defaultAvatar;
    }
    try {
      return require(`../assets/${userImage}`);
    } catch (error) {
      console.warn('Failed to load profile image:', error);
      return defaultAvatar;
    }
  };

  const getBlogImage = (imageName) => {
    if (!imageName) return process.env.PUBLIC_URL + '/placeholder.jpg';
    
    // If it's already a full URL, return as is
    if (imageName.startsWith('http')) return imageName;
    
    // If it's a relative path, prepend PUBLIC_URL
    return process.env.PUBLIC_URL + '/' + imageName;
  };

  const truncatedTitle = title?.length > 20 ? `${title.substring(0, 20)}...` : title;
  const truncatedDesc = desc?.length > 50 ? `${desc.substring(0, 50)} ...` : desc;
  const hasMoreContent = desc?.length > 50;
  const userName = user ? user : 'Anonymous';
  const formattedDate = date ? new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }) : 'Date not available';

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!userId) {
      setSnackbarMessage('Please login to like posts');
      setSnackbarOpen(true);
      return;
    }

    try {
      const response = await axios.post(`${config.BASE_URL}/api/blogs/${id}/like`, { userId });
      setIsLiked(!isLiked);
      setCurrentLikesCount(response.data.blog.likesCount);
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    const blogUrl = `${window.location.origin}/blog/${id}`;
    
    try {
      await navigator.clipboard.writeText(blogUrl);
      await axios.post(`${config.BASE_URL}/api/blogs/${id}/share`);
      setSnackbarMessage('Blog link copied to clipboard!');
      setSnackbarOpen(true);
    } catch (err) {
      setSnackbarMessage('Failed to copy link');
      setSnackbarOpen(true);
    }
  };

  const handleComment = (e) => {
    e.stopPropagation();
    navigate(`/blog/${id}`);
  };

  return (
    <Grid item xs={12} sm={6} md={4} lg={3}>
      <Card 
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
          },
        }}
      >
        <CardActionArea 
          onClick={() => navigate(`/blog/${id}`)}
          sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}
        >
          <CardHeader
            avatar={
              <Avatar
                className={classes.font}
                src={getProfileImage(userImage)}
                sx={{ bgcolor: 'transparent' }}
                imgProps={{
                  onError: (e) => {
                    e.target.src = defaultAvatar;
                  }
                }}
              >
                {userName.charAt(0).toUpperCase()}
              </Avatar>
            }
            title={
              <Typography 
                variant="h6" 
                component="div" 
                sx={{ 
                  fontSize: '1.1rem',
                  fontWeight: 500,
                  lineHeight: 1.2,
                  mb: 0.5
                }}
              >
                {truncatedTitle}
              </Typography>
            }
            subheader={
              <Typography variant="body2" color="text.secondary">
                {userName} • {formattedDate}
              </Typography>
            }
          />
          <Box 
            sx={{ 
              position: 'relative',
              paddingTop: '56.25%', // 16:9 aspect ratio
              width: '100%',
              backgroundColor: 'rgba(0,0,0,0.03)'
            }}
          >
            <Box
              component="img"
              src={getBlogImage(img)}
              alt={title || 'Blog image'}
              onError={(e) => {
                console.error('Failed to load blog image:', img);
                e.target.src = process.env.PUBLIC_URL + '/placeholder.jpg';
              }}
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                backgroundColor: 'rgba(0,0,0,0.03)'
              }}
            />
          </Box>
          <CardContent sx={{ flexGrow: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {truncatedDesc}
              {hasMoreContent && (
                <Box 
                  component="span" 
                  sx={{ 
                    color: 'primary.main',
                    cursor: 'pointer',
                    ml: 1,
                    fontWeight: 'medium',
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                >
                  Read more
                </Box>
              )}
            </Typography>
          </CardContent>
        </CardActionArea>

        <Box 
          sx={{ 
            p: 1,
            display: 'flex',
            justifyContent: 'space-around',
            borderTop: '1px solid rgba(0,0,0,0.1)'
          }}
        >
          <IconButton 
            onClick={handleLike}
            color={isLiked ? "primary" : "default"}
            size="small"
          >
            {isLiked ? <FaHeart /> : <FaRegHeart />}
            <Typography variant="body2" sx={{ ml: 1 }}>
              {currentLikesCount}
            </Typography>
          </IconButton>

          <IconButton
            onClick={() => navigate(`/blog/${id}#comments`)}
            size="small"
          >
            <FaComment />
            <Typography variant="body2" sx={{ ml: 1 }}>
              {commentsCount}
            </Typography>
          </IconButton>

          <IconButton
            onClick={handleShare}
            size="small"
          >
            <FaShare />
            <Typography variant="body2" sx={{ ml: 1 }}>
              {sharesCount}
            </Typography>
          </IconButton>
        </Box>
      </Card>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Grid>
  );
};

export default Blogs;
