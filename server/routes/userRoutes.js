import express from 'express'
import {  getProfile, googleLogin, login, register, searchUsers } from '../controllers/user.controller.js'

const userRouter = express.Router()

userRouter.post('/signup', register)
userRouter.post('/signin', login)
userRouter.post('/google-auth', googleLogin)
userRouter.post('/search-users', searchUsers)
userRouter.post('/get-profile', getProfile)
export default userRouter