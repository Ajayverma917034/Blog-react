import express from 'express'
import { AddComment, AllLatestBlogCount, createBlog, deleteComment, getBlog, getBlogComments, getReplies, isLikedByUser, latestBlog, likeBlog, searchBlog, searchBlogsCount, trendingBlog } from '../controllers/blog.controllers.js'
import { verifyToken } from '../middleware/verifyUser.js'

const BlogRouter = express.Router()

BlogRouter.post('/create-blog',verifyToken, createBlog)
BlogRouter.post('/latest-blog', latestBlog)
BlogRouter.get('/trending-blog', trendingBlog)
BlogRouter.post('/search-blogs', searchBlog)
BlogRouter.post('/all-latest-blogs-count', AllLatestBlogCount)
BlogRouter.post('/all-search-blogs-count', searchBlogsCount)
BlogRouter.post('/get-blog', getBlog)
BlogRouter.post('/like-blog', verifyToken, likeBlog);
BlogRouter.post('/isLiked-by-user', verifyToken, isLikedByUser)
BlogRouter.post('/add-comment', verifyToken, AddComment)
BlogRouter.post('/get-blog-comments', getBlogComments)
BlogRouter.post('/get-replies', getReplies)
BlogRouter.post('/delete-comment', verifyToken, deleteComment)

export default BlogRouter