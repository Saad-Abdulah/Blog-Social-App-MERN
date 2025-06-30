import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import defaultAvatar from '../assets/default-avatar.avif';
import {
  Box,
  Button,
  Container,
  Typography,
  Avatar,
  CircularProgress,
  Paper,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Collapse,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  InputAdornment,
  Grid,
} from '@mui/material';
import { FaTrashAlt, FaEdit, FaComment, FaChevronDown, FaChevronUp, FaHeart, FaRegHeart, FaShare } from 'react-icons/fa';
import { Delete as DeleteIcon, Send as SendIcon } from '@mui/icons-material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import config from '../config';

const BlogDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(true);
  const [loadingComments, setLoadingComments] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const userId = localStorage.getItem("userId");

  const fetchDetails = async () => {
    try {
      const res = await axios.get(`${config.BASE_URL}/api/blogs/${id}`);
      setBlog(res.data.blog);
      // Check if user has liked this blog
      setIsLiked(res.data.blog.likes.includes(userId));
      setLikesCount(res.data.blog.likes.length);
      
      // If URL has #description hash, expand the description
      if (location.hash === '#description') {
        setShowFullDescription(true);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch blog details');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      const res = await axios.get(`${config.BASE_URL}/api/blogs/${id}/comments`);
      setComments(res.data.comments);
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id, location]);

  useEffect(() => {
    if (showComments) {
      fetchComments();
    }
  }, [showComments]);

  const handleAddComment = async () => {
    if (!userId) {
      navigate('/login');
      return;
    }

    if (!newComment.trim()) return;

    try {
      const res = await axios.post(`${config.BASE_URL}/api/blogs/${id}/comment`, {
        content: newComment,
        userId
      });
      setComments([res.data.comment, ...comments]);
      setNewComment('');
      // Update blog's comment count
      setBlog(prev => ({
        ...prev,
        commentsCount: (prev.commentsCount || 0) + 1
      }));
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  const handleEdit = () => {
    navigate(`/blog-update/${id}`);
  };

  const deleteRequest = async () => {
    try {
      await axios.delete(`${config.BASE_URL}/api/blogs/${id}`);
      navigate('/blogs');
    } catch (err) {
      setError(err.message || 'Failed to delete blog');
    }
  };

  const handleDelete = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleConfirmDelete = () => {
    setOpenDialog(false);
    deleteRequest();
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
      });
  };

  const getBlogImage = (imageName) => {
    if (!imageName) return process.env.PUBLIC_URL + '/placeholder.jpg';
    
    // If it's already a full URL, return as is
    if (imageName.startsWith('http')) return imageName;
    
    // If it's a relative path, prepend PUBLIC_URL
    return process.env.PUBLIC_URL + '/' + imageName;
  };

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

  const handleExpandDescription = () => {
    setShowFullDescription(!showFullDescription);
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
      <Container>
        <Typography color="error" variant="h6" align="center">
          {error}
        </Typography>
      </Container>
    );
  }

  if (!blog) {
    return (
      <Container>
        <Typography variant="h6" align="center">
          Blog not found
        </Typography>
      </Container>
    );
  }

  const isUser = localStorage.getItem('userId') === blog.user._id;
  
  const formattedDate = new Date(blog.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Box
            display="flex"
      flexDirection="column"
      alignItems="center"
      sx={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: { xs: 2, md: 4 },
      }}
          >
      {blog && (
        <>
          <Paper 
            elevation={3}
            sx={{
              width: '100%',
              overflow: 'hidden',
              borderRadius: 2,
              mb: 4
            }}
          >
            <Box
              component="img"
              src={getBlogImage(blog.img)}
              alt={blog.title}
              onError={(e) => {
                console.error('Failed to load blog image:', blog.img);
                e.target.src = process.env.PUBLIC_URL + '/placeholder.jpg';
              }}
              sx={{
                width: '100%',
                height: '400px',
                objectFit: 'contain',
                backgroundColor: 'rgba(0,0,0,0.03)'
              }}
            />

            <Box sx={{ p: 3 }}>
              <Box 
                display="flex" 
                alignItems="center"
                justifyContent="space-between"
                mb={2}
              >
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar
                    src={getProfileImage(blog.user?.profileImage)}
                    alt={blog.user?.name}
                    sx={{ width: 40, height: 40 }}
                  />
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {blog.user?.name || 'Anonymous'}
            </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formattedDate}
                    </Typography>
                  </Box>
                </Box>

                {/* Social Stats */}
                <Box display="flex" alignItems="center" gap={3}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <FaHeart color={isLiked ? "#f44336" : "#666"} />
                    <Typography variant="body2" color="text.secondary">
                      {likesCount}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <FaComment color="#666" />
                    <Typography variant="body2" color="text.secondary">
                      {blog.commentsCount || 0}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <FaShare color="#666" />
                    <Typography variant="body2" color="text.secondary">
                      {blog.shares || 0}
                    </Typography>
                  </Box>
                </Box>

                {/* Edit/Delete Buttons */}
                {isUser && (
                  <Box display="flex" gap={1}>
                    <IconButton 
                      onClick={handleEdit}
                      sx={{ 
                        color: 'primary.main',
                        '&:hover': { backgroundColor: 'primary.light' }
                      }}
                    >
                      <FaEdit />
                    </IconButton>
                    <IconButton 
                      onClick={handleDelete}
                      sx={{ 
                        color: 'error.main',
                        '&:hover': { backgroundColor: 'error.light' }
                      }}
                    >
                      <FaTrashAlt />
                    </IconButton>
                  </Box>
                )}
              </Box>

              <Typography variant="h4" gutterBottom>
                {blog.title}
              </Typography>

              <Box sx={{ mt: 2 }}>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    whiteSpace: 'pre-wrap',
                    mb: blog.desc?.length > 200 ? 1 : 0
                  }}
                >
                  {showFullDescription 
                    ? blog.desc
                    : blog.desc?.length > 200 
                      ? `${blog.desc.substring(0, 200)} ...` 
                      : blog.desc
                  }
                </Typography>
                
                {blog.desc?.length > 200 && (
                  <Button
                    onClick={handleExpandDescription}
                    endIcon={showFullDescription ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    sx={{ 
                      textTransform: 'none',
                      mt: 1,
                      '&:hover': {
                        backgroundColor: 'transparent',
                        textDecoration: 'underline'
                      }
                    }}
                  >
                    {showFullDescription ? 'Show less' : 'Read more'}
                  </Button>
                )}
              </Box>

          {/* Comments Section */}
          <Box sx={{ mt: 4 }}>
            <Button
              onClick={() => setShowComments(!showComments)}
              startIcon={showComments ? <FaChevronUp /> : <FaChevronDown />}
              sx={{ mb: 2 }}
            >
              {showComments ? 'Hide' : 'Show'} Comments ({blog.commentsCount || 0})
            </Button>

            <Collapse in={showComments}>
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={userId ? "Write a comment..." : "Please login to comment"}
                  disabled={!userId}
                  sx={{ mb: 1 }}
                />
                <Button
                  variant="contained"
                  onClick={handleAddComment}
                  disabled={!userId || !newComment.trim()}
                  startIcon={<FaComment />}
                >
                  Add Comment
                </Button>
              </Box>

              {loadingComments ? (
                <Box display="flex" justifyContent="center" p={2}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <List>
                  {comments.map((comment, index) => (
                    <React.Fragment key={comment._id}>
                      <ListItem alignItems="flex-start">
                        <ListItemAvatar>
                          <Avatar 
                            src={getProfileImage(comment.user?.profileImage)}
                            sx={{ 
                              width: 40, 
                              height: 40,
                              bgcolor: 'transparent'
                            }}
                            imgProps={{
                              onError: (e) => {
                                e.target.src = defaultAvatar;
                              }
                            }}
                          >
                            {comment.user?.name?.charAt(0).toUpperCase()}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography component="div" variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {comment.user?.name || 'Anonymous'}
                            </Typography>
                          }
                          secondary={
                            <>
                              <Typography
                                component="div"
                                variant="body2"
                                color="text.primary"
                                sx={{ my: 1 }}
                              >
                                {comment.content}
                              </Typography>
                              <Typography
                                component="div"
                                variant="caption"
                                color="text.secondary"
                              >
                                {formatDate(comment.createdAt)}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                      {index < comments.length - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                  ))}
                  {comments.length === 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                      No comments yet. Be the first to comment!
                    </Typography>
                  )}
                </List>
              )}
            </Collapse>
          </Box>
          </Box>
          </Paper>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Delete Blog Post?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this blog post? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmDelete} 
            color="error" 
            variant="contained"
            startIcon={<FaTrashAlt />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BlogDetail;
