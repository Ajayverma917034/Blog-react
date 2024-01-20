import express from 'express'
import { AddComment, AllLatestBlogCount, createBlog, deleteBlog, deleteComment, getBlog, getBlogComments, getReplies, isLikedByUser, latestBlog, likeBlog, searchBlog, searchBlogsCount, trendingBlog, userWrittenUser, userWrittenUserCount } from '../controllers/blog.controllers.js'
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
BlogRouter.post('/user-written-blogs', verifyToken, userWrittenUser)
BlogRouter.post('/user-written-blogs-count', verifyToken, userWrittenUserCount)
BlogRouter.post('/delete-blog', verifyToken, deleteBlog)

export default BlogRouter