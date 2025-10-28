import React, { createContext, useContext, useState, useCallback } from "react";
import api from "../utils/api";

const PostsContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const usePosts = () => {
  const context = useContext(PostsContext);
  if (!context) {
    throw new Error("usePosts must be used within a PostsProvider");
  }
  return context;
};

export const PostsProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [currentPost, setCurrentPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);

  const fetchPosts = useCallback(async (page = 1, searchTerm = "") => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(
        `/api/posts/all-posts?page=${page}&search=${searchTerm}`
      );
      setPosts(data.data || []);
      setCurrentPage(data.currentPage || 1);
      setTotalPages(data.totalPages || 1);
      setTotalPosts(data.totalPosts || 0);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setError(error.response?.data?.message || "Failed to fetch posts");
      setPosts([]);
      setCurrentPage(1);
      setTotalPages(1);
      setTotalPosts(0);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSinglePost = useCallback(async (postId) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/api/posts/single-post?_id=${postId}`);
      if (data.success) {
        setCurrentPost(data.data);
        return data.data;
      } else {
        throw new Error(data.message || "Failed to fetch post");
      }
    } catch (error) {
      console.error("Error fetching single post:", error);
      setError(
        error.response?.data?.message || error.message || "Failed to fetch post"
      );
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createPost = useCallback(async (postData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post("/api/posts/create-post", postData);
      const newPost = data.data || data;

      // Optimistic update - add to beginning of posts array
      setPosts((prev) => [newPost, ...prev]);

      // Update total posts count
      setTotalPosts((prev) => prev + 1);

      return { success: true, post: newPost };
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to create post";
      setError(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePost = useCallback(
    async (postId, postData) => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.put(
          `/api/posts/update-post?_id=${postId}`,
          postData
        );
        const updatedPost = data.data || data;

        // Update posts list
        setPosts((prev) =>
          prev.map((post) => (post._id === postId ? updatedPost : post))
        );

        // Update current post if it's the one being edited
        if (currentPost && currentPost._id === postId) {
          setCurrentPost(updatedPost);
        }

        return { success: true, post: updatedPost };
      } catch (error) {
        const errorMsg =
          error.response?.data?.message || "Failed to update post";
        setError(errorMsg);
        return { success: false, message: errorMsg };
      } finally {
        setLoading(false);
      }
    },
    [currentPost]
  );

  const deletePost = useCallback(
    async (postId) => {
      setLoading(true);
      setError(null);
      try {
        await api.delete(`/api/posts/delete-post?_id=${postId}`);

        // Remove from posts list
        setPosts((prev) => prev.filter((post) => post._id !== postId));

        // Clear current post if it's the one being deleted
        if (currentPost && currentPost._id === postId) {
          setCurrentPost(null);
        }

        // Update total posts count
        setTotalPosts((prev) => Math.max(0, prev - 1));

        return { success: true };
      } catch (error) {
        const errorMsg =
          error.response?.data?.message || "Failed to delete post";
        setError(errorMsg);
        return { success: false, message: errorMsg };
      } finally {
        setLoading(false);
      }
    },
    [currentPost]
  );

  const clearCurrentPost = useCallback(() => setCurrentPost(null), []);
  const clearError = useCallback(() => setError(null), []);

  const value = {
    posts,
    currentPost,
    fetchPosts,
    fetchSinglePost,
    createPost,
    updatePost,
    deletePost,
    clearCurrentPost,
    loading,
    error,
    clearError,
    currentPage,
    totalPages,
    totalPosts,
    setCurrentPage,
  };

  return (
    <PostsContext.Provider value={value}>{children}</PostsContext.Provider>
  );
};
