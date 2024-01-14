import express from 'express'
import {  changePassword, getProfile, googleLogin, login, register, searchUsers, updateProfile, updateProfileImg } from '../controllers/user.controller.js'
import { verifyToken } from '../middleware/verifyUser.js'

const userRouter = express.Router()

userRouter.post('/signup', register)
userRouter.post('/signin', login)
userRouter.post('/google-auth', googleLogin)
userRouter.post('/search-users', searchUsers)
userRouter.post('/get-profile', getProfile)
userRouter.post('/change-password', verifyToken, changePassword)
userRouter.post('/update-profile-img',verifyToken, updateProfileImg)
userRouter.post('/update-profile',verifyToken, updateProfile)
export default userRouter