import express from 'express'
import mongoose from 'mongoose'
import 'dotenv/config'
import cors from 'cors'
import admin from 'firebase-admin'
import {v2 as cloudinary} from 'cloudinary'
import fileUpload from 'express-fileupload'
import serviceAccountKey from './react-blogging-52b70-firebase-adminsdk-8kfmz-9325587be1.json' assert {
    type: "json"
}
import { ErrorThrow } from './utils/error.js'
import BlogRouter from './routes/blogRoutes.js'
import userRouter from './routes/userRoutes.js'
import notificationRouter from './routes/notification.js'



const server = express();
server.use(express.json())
server.use(fileUpload({
    useTempFiles: true
}))
let PORT = 3000;
server.use(cors())
admin.initializeApp({
    credential: admin.credential.cert(serviceAccountKey)
})

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});


mongoose.connect(process.env.DB_CONNECTION, {
    autoIndex: true
}).then(()=>{
    console.log("Database connected Successfully")
}).catch((err)=>{
    console.error(err)
})



server.get('/', (req, res) =>{
    res.send("Hello from the server side")
})


server.post('/upload-image' , async (req, res)=>{
    try{
        const {image} = req.files;
        await cloudinary.uploader.upload(image.tempFilePath, (err, result)=>{
            if(err){
                return res.status(500).json({error: err})
            }
            else{
                return res.status(202).json({"url": result.url})
            }
        })
    } 
    catch(err){
        console.log(err.message)
        res.status(500).json({error: err.message})
    }
})


server.use(userRouter)
server.use(BlogRouter)
server.use(notificationRouter)


server.use(ErrorThrow)

server.listen(PORT, ()=>{
    console.log("Listing on port ->" + PORT)
})