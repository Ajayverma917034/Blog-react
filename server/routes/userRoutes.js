import express from 'express'
import {  googleLogin, login, register } from '../controllers/user.controller.js'

const userRouter = express.Router()

userRouter.post('/signup', register)
userRouter.post('/signin', login)
userRouter.post('/google-auth', googleLogin)
export default userRouter