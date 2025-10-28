import React, { useEffect, useState, useCallback, useMemo } from "react";
import { usePosts } from "../hooks/PostsContext";
import { useAuth } from "../hooks/useAuth";
import AuthModal from "../components/AuthModal";
import PostModal from "../components/PostModal ";
import PostDetails from "../components/PostDetails";

const Home = () => {
  const {
    posts,
    fetchPosts,
    loading: postsLoading,
    error: postsError,
    currentPage,
    totalPages,
  } = usePosts();

  const {
    user: contextUser,
    loading: authLoading,
    login,
    signup,
    checkAuth,
  } = useAuth();

  const [localUser, setLocalUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showPostDetails, setShowPostDetails] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Sync context user with local state
  useEffect(() => {
    setLocalUser(contextUser);
  }, [contextUser]);

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchPosts(currentPage, searchTerm); // send searchTerm to backend
    }, 500); // debounce 500ms
    return () => clearTimeout(delay);
  }, [currentPage, searchTerm, fetchPosts]);

  // Pagination logic
  const pagesToShow = 5;
  const paginationRange = useMemo(() => {
    const start = Math.max(1, currentPage - Math.floor(pagesToShow / 2));
    const end = Math.min(totalPages, start + pagesToShow - 1);
    const pages = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }, [currentPage, totalPages]);

  const handlePageChange = useCallback(
    (page) => {
      if (page < 1 || page > totalPages || page === currentPage) return;
      fetchPosts(page);
      // REMOVED the scroll to top - this was causing the issue
    },
    [currentPage, totalPages, fetchPosts]
  );

  const handleEngage = useCallback(
    (postId) => {
      if (!localUser) return setShowAuthModal(true);
      setSelectedPostId(postId);
      setShowPostDetails(true);
    },
    [localUser]
  );

  const handleCreatePost = useCallback(() => {
    if (!localUser) return setShowAuthModal(true);
    setEditingPost(null);
    setShowPostModal(true);
  }, [localUser]);

  const handleEditPost = useCallback((post) => {
    setEditingPost(post);
    setShowPostDetails(false);
    setShowPostModal(true);
  }, []);

  const handleLogin = async (email, password) => {
    const result = await login(email, password);
    if (result.success) setLocalUser(result.user);
    return result;
  };

  const handleSignup = async (userData) => {
    const result = await signup(userData);
    if (result.success) setLocalUser(result.user);
    return result;
  };

  const handleAuthSuccess = useCallback(() => {
    setShowAuthModal(false);
    setTimeout(() => checkAuth(), 100);
  }, [checkAuth]);

  const handlePostModalClose = useCallback(() => {
    setShowPostModal(false);
    setEditingPost(null);
    fetchPosts(currentPage);
  }, [currentPage, fetchPosts]);

  const handlePostDetailsClose = useCallback(() => {
    setShowPostDetails(false);
    setSelectedPostId(null);
  }, []);

  const isAuthenticated = !!localUser;

  // Render loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const renderPaginationButton = (
    page,
    label,
    isDisabled = false,
    isActive = false
  ) => (
    <button
      onClick={() => handlePageChange(page)}
      disabled={isDisabled}
      className={`w-10 h-10 rounded-lg border text-gray-700 hover:bg-gray-50 transition-colors ${
        isActive
          ? "bg-blue-500 border-blue-500 text-white shadow-md"
          : "bg-white border-gray-300"
      } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Share Your Voice with the World
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Join thousands of creators sharing their stories, ideas, and
              experiences. Connect, engage, and grow with our vibrant community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() =>
                  document
                    .getElementById("features")
                    .scrollIntoView({ behavior: "smooth" })
                }
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:bg-opacity-10 transition-colors"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose PostHub?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover the features that make PostHub the perfect platform for
              content creators and readers alike.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-blue-600"
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
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Easy Content Creation
              </h3>
              <p className="text-gray-600">
                Create beautiful posts with our intuitive editor. No technical
                skills required.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Vibrant Community</h3>
              <p className="text-gray-600">
                Connect with like-minded individuals and grow your audience.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure & Reliable</h3>
              <p className="text-gray-600">
                Your data is safe with us. We use industry-standard security
                practices.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Posts Section */}
      <section className="py-10 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Latest from Our Community
            </h2>
            <p className="text-xl text-gray-600">
              Discover what others are sharing
            </p>
          </div>
          <div className="mb-6 flex justify-center">
            <input
              type="text"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") fetchPosts(1, searchTerm); // optional: trigger search on Enter
              }}
              className="w-full max-w-md px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Create Post Button */}
          {isAuthenticated && (
            <div className="mb-8 flex justify-center">
              <button
                onClick={handleCreatePost}
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors flex items-center gap-2 shadow-lg"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create New Post
              </button>
            </div>
          )}

          {/* Loading / Error States */}
          {postsLoading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading posts...</p>
            </div>
          )}

          {postsError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6 text-center max-w-2xl mx-auto">
              {postsError}
            </div>
          )}

          {!postsLoading && posts.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg
                  className="w-24 h-24 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                No Posts Yet
              </h3>
              <p className="text-gray-600 mb-6">
                {isAuthenticated
                  ? "Be the first to create a post and start the conversation!"
                  : "Sign in to create the first post and start the conversation!"}
              </p>
              {!isAuthenticated && (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Sign In to Post
                </button>
              )}
            </div>
          )}

          {/* Posts Grid */}
          {!postsLoading && posts.length > 0 && (
            <>
              <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post) => (
                  <div
                    key={post._id}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden"
                  >
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-3 text-gray-800 line-clamp-2">
                        {post.title || "Untitled Post"}
                      </h3>
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {post.description ||
                          post.content ||
                          "No description available."}
                      </p>

                      <div className="flex justify-between items-center mb-4 text-sm text-gray-500">
                        <p>By: {post.userId?.email || "Unknown User"}</p>
                        <p>{new Date(post.createdAt).toLocaleDateString()}</p>
                      </div>

                      {isAuthenticated &&
                        localUser &&
                        post.userId?._id === localUser._id && (
                          <button
                            onClick={() => handleEditPost(post)}
                            className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50 transition-colors mb-2 self-start"
                          >
                            Edit
                          </button>
                        )}

                      <button
                        onClick={() => handleEngage(post._id)}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-xl transition-colors duration-200"
                      >
                        {isAuthenticated ? "View Details" : "Sign in to View"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-12">
                  {renderPaginationButton(
                    currentPage - 1,
                    "←",
                    currentPage === 1
                  )}

                  {paginationRange[0] > 1 && (
                    <>
                      {renderPaginationButton(1, "1")}
                      {paginationRange[0] > 2 && (
                        <span className="w-10 h-10 flex items-center justify-center text-gray-500">
                          ...
                        </span>
                      )}
                    </>
                  )}

                  {paginationRange.map((page) =>
                    renderPaginationButton(
                      page,
                      page,
                      false,
                      currentPage === page
                    )
                  )}

                  {paginationRange[paginationRange.length - 1] < totalPages && (
                    <>
                      {paginationRange[paginationRange.length - 1] <
                        totalPages - 1 && (
                        <span className="w-10 h-10 flex items-center justify-center text-gray-500">
                          ...
                        </span>
                      )}
                      {renderPaginationButton(totalPages, totalPages)}
                    </>
                  )}

                  {renderPaginationButton(
                    currentPage + 1,
                    "→",
                    currentPage === totalPages
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Sharing?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join our community of creators today and start sharing your stories
            with the world.
          </p>
        </div>
      </section>

      {/* Modals */}
      {showAuthModal && (
        <AuthModal
          initialMode="signin"
          onClose={handleAuthSuccess}
          customLogin={handleLogin}
          customSignup={handleSignup}
        />
      )}
      {showPostModal && (
        <PostModal
          isOpen={showPostModal}
          onClose={handlePostModalClose}
          editPost={editingPost}
        />
      )}
      {showPostDetails && (
        <PostDetails
          isOpen={showPostDetails}
          onClose={handlePostDetailsClose}
          postId={selectedPostId}
          onEdit={handleEditPost}
        />
      )}
    </div>
  );
};

export default Home;
