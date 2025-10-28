import React, { useEffect, useState, useRef, useCallback } from "react";
import { usePosts } from "../hooks/PostsContext";
import { useAuth } from "../hooks/useAuth";
import Button from "../components/Button";

const PostDetails = ({ isOpen, onClose, postId, onEdit }) => {
  const {
    fetchSinglePost,
    currentPost,
    deletePost,
    loading,
    clearCurrentPost,
    error,
  } = usePosts();
  const { user } = useAuth();
  const [deleteLoading, setDeleteLoading] = useState(false);
  const hasFetchedRef = useRef(false);
  const previousPostIdRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      hasFetchedRef.current = false;
      previousPostIdRef.current = null;
      return;
    }

    if (
      isOpen &&
      postId &&
      (!hasFetchedRef.current || previousPostIdRef.current !== postId)
    ) {
      hasFetchedRef.current = true;
      previousPostIdRef.current = postId;
      fetchSinglePost(postId);
    }
  }, [isOpen, postId, fetchSinglePost]);

  const handleClose = useCallback(() => {
    hasFetchedRef.current = false;
    previousPostIdRef.current = null;
    clearCurrentPost();
    onClose();
  }, [clearCurrentPost, onClose]);

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this post? This action cannot be undone."
      )
    ) {
      return;
    }

    setDeleteLoading(true);
    try {
      const result = await deletePost(postId);
      if (result.success) {
        handleClose();
      }
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const getAuthorEmail = () => {
    if (!currentPost?.userId) return "Unknown User";

    if (typeof currentPost.userId === "object" && currentPost.userId.email) {
      return currentPost.userId.email;
    }

    if (typeof currentPost.userId === "string") {
      return currentPost.userId;
    }

    return "Unknown User";
  };

  const isAuthor =
    currentPost &&
    user?._id &&
    ((typeof currentPost.userId === "object" &&
      currentPost.userId._id === user._id) ||
      (typeof currentPost.userId === "string" &&
        currentPost.userId === user._id));

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800">Post Details</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center">
              Error: {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading post details...</p>
              </div>
            </div>
          ) : currentPost?._id === postId ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  {currentPost.title}
                </h3>
                <div className="bg-gray-50 rounded-lg p-6">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-lg">
                    {currentPost.description}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-500 space-y-2">
                  <p>
                    <strong>Author:</strong> {getAuthorEmail()}
                  </p>
                  <p>
                    <strong>Created:</strong>{" "}
                    {new Date(currentPost.createdAt).toLocaleDateString()} at{" "}
                    {new Date(currentPost.createdAt).toLocaleTimeString()}
                  </p>
                  {currentPost.updatedAt &&
                    currentPost.updatedAt !== currentPost.createdAt && (
                      <p>
                        <strong>Updated:</strong>{" "}
                        {new Date(currentPost.updatedAt).toLocaleDateString()}{" "}
                        at{" "}
                        {new Date(currentPost.updatedAt).toLocaleTimeString()}
                      </p>
                    )}
                </div>

                {isAuthor && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => onEdit(currentPost)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      Edit
                    </Button>
                    <Button
                      onClick={handleDelete}
                      disabled={deleteLoading}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:bg-red-400 flex items-center gap-2"
                    >
                      {deleteLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Deleting...
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          Delete
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Post Not Found
              </h3>
              <p className="text-gray-600 mb-4">
                The post you're looking for doesn't exist or may have been
                deleted.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDetails;
