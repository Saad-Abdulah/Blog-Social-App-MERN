import './App.css';
import { Route, Routes } from "react-router-dom";
import Header from './componets/Header';
import React, { useEffect } from 'react';
import Login from './componets/Login';
import Blogs from './componets/Blogs';
import UserBlogs from './componets/UserBlogs'
import AddBlogs from './componets/AddBlogs'
import BlogDetail from './componets/BlogDetail'
import UpdateBlog from './componets/UpdateBlog'
import { useDispatch } from 'react-redux';
import { authActions } from './store';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if(userId) {
      dispatch(authActions.login());
    }
  }, [dispatch]);
  
  return (
    <React.Fragment>
    <header>
      <Header/>
    </header>
    <main>
    <Routes>
          <Route path="/login" element={<Login/>} />
          <Route path="/blogs" element={<Blogs/>} />
          <Route path="/myBlogs" element={<UserBlogs/>} />
          <Route path="/blog/:id" element={<BlogDetail/>} />
          <Route path="/blog-update/:id" element={<UpdateBlog/>} />
          <Route path="/blogs/add" element={<AddBlogs/>} />
          <Route path="/" element={<Blogs/>} />
    </Routes>
    </main>
    </React.Fragment>
  );
}

export default App;
