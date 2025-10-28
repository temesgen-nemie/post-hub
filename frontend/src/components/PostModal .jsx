import React, { useState, useEffect, useRef, useCallback } from "react";
import Input from "../components/Input";
import Button from "../components/Button";
import { usePosts } from "../hooks/PostsContext";

const PostModal = ({ isOpen, onClose, editPost = null }) => {
  const { createPost, updatePost, loading: postsLoading } = usePosts();
  const [form, setForm] = useState({ title: "", description: "" });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const modalRef = useRef();

  useEffect(() => {
    if (editPost) {
      setForm({
        title: editPost.title || "",
        description: editPost.description || "",
      });
    } else {
      setForm({ title: "", description: "" });
    }
    setError(null);
    setSuccess(null);
  }, [editPost, isOpen]);

  const handleBackdropClick = useCallback(
    (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.title.trim() || !form.description.trim()) {
      setError("Please fill in both title and description");
      return;
    }

    if (form.title.length < 3) {
      setError("Title should be at least 3 characters long");
      return;
    }

    try {
      let result;
      if (editPost) {
        result = await updatePost(editPost._id, form);
      } else {
        result = await createPost(form);
      }

      if (result.success) {
        setSuccess(
          editPost ? "Post updated successfully!" : "Post created successfully!"
        );
        setTimeout(() => {
          onClose();
          setForm({ title: "", description: "" });
        }, 1500);
      } else {
        setError(result.message);
      }
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError("An unexpected error occurred");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800">
            {editPost ? "Edit Post" : "Create New Post"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Post Title"
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              placeholder="Enter a catchy title..."
              required
              disabled={postsLoading}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Share your thoughts..."
                required
                disabled={postsLoading}
                rows="6"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                {form.description.length}/1000 characters
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                onClick={onClose}
                disabled={postsLoading}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  postsLoading || !form.title.trim() || !form.description.trim()
                }
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {postsLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {editPost ? "Updating..." : "Creating..."}
                  </div>
                ) : editPost ? (
                  "Update Post"
                ) : (
                  "Create Post"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostModal;
