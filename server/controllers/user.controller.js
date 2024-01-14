import { getAuth } from "firebase-admin/auth";
import User from "../Schema/User.js";
import ErrorHanlder from "../utils/Errorhandler.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { nanoid } from "nanoid";

const generateUserName = async (email) => {
    let username = email.split("@")[0];
    let isUserNameUnique = await User.exists({ "personal_info.username": username }).then((result) => result)

    isUserNameUnique ? username += nanoid().substring(0, 5) : "";

    return username

}
let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

const formatDataToSend = (user) => {
    const access_token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
    return {
        access_token,
        profile_img: user.personal_info.profile_img,
        username: user.personal_info.username,
        fullname: user.personal_info.fullname
    }
}
export const register = async (req, res, next) => {
    try {
        const { fullname, email, password } = req.body;
        if (!fullname || fullname.length < 3)
            return next(new ErrorHanlder(403, "Full name must be 3 letters long"))
        if (!email.length)
            return res.status(403).json({ "error": "Enter email" })

        if (!emailRegex.test(email)) {
            return res.status(403).json({ "error": "Email is invalid" })
        }
        if (!passwordRegex.test(password)) {
            return res.status(403).json({ "error": 'password should be 6 to 20 characters long with a numeric, 1 uppercase and 1 lowercase lettes' })
        }

        bcrypt.hash(password, 10, async (err, hashed_password) => {
            let username = await generateUserName(email)
            let user = new User({
                personal_info: {
                    fullname, email, password: hashed_password, username
                }
            })
            user.save().then((u) => {
                return res.status(200).json(formatDataToSend(u))
            })
                .catch((err) => {
                    if (err.code === 11000) {
                        return res.status(500).json({ "error": "Email already exists" })
                    }
                    return res.status(500).json({ 'error': err.message })
                })
        })
        // return res.status(200).json({'status': "ok"})
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

export const login = async (req, res) => {
    try {
        let { email, password } = req.body;
        User.findOne({ "personal_info.email": email }).then((user) => {
            if (!user) {
                return res.status(403).json({ "error": "Email not found" })
            }
            if (!user.google_auth) {
                bcrypt.compare(password, user.personal_info.password, (err, result) => {
                    if (err)
                        return res.status(403).json({ "error": "Error Occur while login please try again" })

                    if (!result) {
                        return res.status(403).json({ "error": "Invalid Credential" })
                    }
                    else {
                        return res.status(200).json(formatDataToSend(user))
                    }
                })

            }
            else {
                return res.status(403).json({ "error": "Account was created using google. Try using Google" })
            }
        })
            .catch(err => {
                console.log(err)
                return res.status(500).json({ "error": err.message })
            })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

export const googleLogin = async (req, res) => {
    try {
        let { access_token } = req.body;
        getAuth().verifyIdToken(access_token).then(async (decodedUser) => {
            let { email, name, picture } = decodedUser
            picture = picture.replace('s96-c', 's384-c')

            let user = await User.findOne({ "personal_info.email": email }).select("personal_info.fullname personal_info.fullname personal_info.username personal_info.profile_img google_auth").then((u) => {
                return u || null
            }).catch((err) => {
                return res.status(505).json({ "error": err.message })
            })


            if (user) { // login
                if (!user.google_auth) {
                    return res.status(403).json({ "error": "This email was signed up without google. Please log in with password to access the account" })
                }
            }
            else { // sign up
                let username = await generateUserName(email)
                user = new User({
                    personal_info: { fullname: name, email, profile_img: picture, username },
                    google_auth: true
                })
                await user.save().then((u) => {
                    user = u;
                }).catch((err) => {
                    return res.status(505).json({ "error": err.message })
                })
            }

            return res.status(200).json(formatDataToSend(user))

        })
            .catch((err) => {
                return res.status(500).json({ "error": "Failed to authenticate you with goole, Try with others account" })
            })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

export const searchUsers = (req, res) => {
    try {
        let { query } = req.body;
        User.find({ "personal_info.username": new RegExp(query, 'i') })
            .limit(50)
            .select("personal_info.fullname personal_info.username personal_info.profile_img -_id")
            .then(users => {
                return res.status(200).json({ users })

            })
            .catch(err => {
                return res.status(500).json({ error: err.message })
            })
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

export const getProfile = (req, res) => {
    try {
        let { username } = req.body
        User.findOne({ "personal_info.username": username })
            .select("-personal_info.password -google_auth -updatedAt -blogs")
            .then(user => {
                return res.status(200).json(user)
            })
            .catch(err => {
                console.log(err)
                return res.status(500).json({ error: err.message })
            })
    } catch (error) {
        return res.status(500).json({ error: error.message })

    }
}

export const changePassword = (req, res) =>{
    let {currentPassword, newPassword} = req.body;

    if(!passwordRegex.test(currentPassword) || !passwordRegex.test(newPassword)){
        return res.status(403).json({error: 'password should be 6 to 20 characters long with a numeric, 1 uppercase and 1 lowercase lettes'
      })

    }

    User.findOne({_id: req.user})
    .then((user) =>{
        if(user.google_auth){
            return res.status(403).json({error: "You cannot change account's password because you logged in through google"})
        }

        bcrypt.compare(currentPassword, user.personal_info.password, (err, result) =>{
            if(err){
                return res.status(500).json({error: 'Some error occured while changing the password, please try again later'})
            }

            if(!result){
                return res.status(403).json({error: 'Incorrect current Password'})
            }

            bcrypt.hash(newPassword, 10, (err, hashed_password) =>{
                if(err){
                    return res.status(500).json({error: err.message})
                }
                User.findOneAndUpdate({_id: req.user}, {"personal_info.password" : hashed_password})
                .then((u) => {
                    return res.status(200).json({status: "password changed"})
                })
                .catch(err => {
                    return res.status(500).json({error: 'Some error occured while saving the new password, please try again later'})
                })
            })
        })
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({error: 'User not found'})
    })
}


export const updateProfileImg = (req, res) => {
    let {url} = req.body

    User.findOneAndUpdate({_id: req.user}, {"personal_info.profile_img": url})
    .then(() => {
        return res.status(200).json({profile_img: url})
    })
    .catch(err => {
        return res.status(500).json({error: err.message})
    })
} 

export const updateProfile = (req, res) => {
    let {username, bio, social_links} = req.body;

    let bioLimit = 150
    if(username.length < 3)
        return res.status(403).json({error: "Username should be at least 3 letter long"})
    
    if(bio.length > bioLimit){
        return res.status(403).json({error: `Bio should not be more than ${bioLimit} characters` })
    }

    let socialLinksArr = Object.keys(social_links);
    try {
        for(let i=0; i<socialLinksArr.length; i++){
            if(social_links[socialLinksArr[i]].length){
                let hostname = new URL(social_links[socialLinksArr[i]]).hostname;

                if(!hostname.includes(`${socialLinksArr[i]}.com`) && socialLinksArr[i] != 'website'){
                    return res.status(403).json({error: `${socialLinksArr[i]} link is invalid. You must enter a valid link.`})
                }
            }
        }
    } catch (error) {
        return res.status(500).json({error: 'You must provide full social links with http(s) include'})
    }

    let updateObj = {
        'personal_info.username': username,
        'personal_info.bio': bio,
        social_links
    }

    User.findOneAndUpdate({_id: req.user}, updateObj, {
        runValidators: true,
    })
    .then(() => {
        return res.status(200).json({username})
    })
    .catch(err => {
        if(err.code == 11000){
            return res.status(409).json({error: "Username is already taken"})
        }
        return res.status(500).json({error: err.message})
    })
}