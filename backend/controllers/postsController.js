const { createPostSchema } = require("../middlewares/validator");
const Post = require("../models/postsModel");

exports.getPosts = async (req, res) => {
  const { page, search } = req.query;
  const postsPerPage = 6;

  try {
    let pageNum = 0;
    if (page <= 1) pageNum = 0;
    else pageNum = page - 1;

    // Build search query
    let query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Get total count of posts matching search
    const totalPosts = await Post.countDocuments(query);

    const totalPages = Math.ceil(totalPosts / postsPerPage);

    const result = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip(pageNum * postsPerPage)
      .limit(postsPerPage)
      .populate({
        path: "userId",
        select: "email",
      });

    res.status(200).json({
      success: true,
      message: "posts",
      data: result,
      totalPages,
      currentPage: parseInt(page) || 1,
      totalPosts,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.singlePost = async (req, res) => {
  const { _id } = req.query;

  try {
    const existingPost = await Post.findOne({ _id }).populate({
      path: "userId",
      select: "email",
      // Add this to handle deleted users
      options: {
        allowNull: true,
      },
    });

    if (!existingPost) {
      return res
        .status(404)
        .json({ success: false, message: "Post unavailable" });
    }

    // If user is deleted, you might want to handle it here
    const postData = existingPost.toObject();
    if (!postData.userId) {
      postData.userId = { email: "Deleted User" }; // Or whatever fallback you prefer
    }

    res
      .status(200)
      .json({ success: true, message: "single post", data: postData });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.createPost = async (req, res) => {
  const { title, description } = req.body;
  const { userId } = req.user;
  try {
    const { error, value } = createPostSchema.validate({
      title,
      description,
      userId,
    });
    if (error) {
      return res
        .status(401)
        .json({ success: false, message: error.details[0].message });
    }

    const result = await Post.create({
      title,
      description,
      userId,
    });
    res.status(201).json({ success: true, message: "created", data: result });
  } catch (error) {
    console.log(error);
  }
};

exports.updatePost = async (req, res) => {
  const { _id } = req.query;
  const { title, description } = req.body;
  const { userId } = req.user;
  try {
    const { error, value } = createPostSchema.validate({
      title,
      description,
      userId,
    });
    if (error) {
      return res
        .status(401)
        .json({ success: false, message: error.details[0].message });
    }
    const existingPost = await Post.findOne({ _id });
    if (!existingPost) {
      return res
        .status(404)
        .json({ success: false, message: "Post unavailable" });
    }
    if (existingPost.userId.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }
    existingPost.title = title;
    existingPost.description = description;

    const result = await existingPost.save();
    res.status(200).json({ success: true, message: "Updated", data: result });
  } catch (error) {
    console.log(error);
  }
};

exports.deletePost = async (req, res) => {
  const { _id } = req.query;

  const { userId } = req.user;
  try {
    const existingPost = await Post.findOne({ _id });
    if (!existingPost) {
      return res
        .status(404)
        .json({ success: false, message: "Post already unavailable" });
    }
    if (existingPost.userId.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    await Post.deleteOne({ _id });
    res.status(200).json({ success: true, message: "deleted" });
  } catch (error) {
    console.log(error);
  }
};
