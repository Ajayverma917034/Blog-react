import jwt from 'jsonwebtoken'
export const verifyToken = (req, res, next) =>{
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(" ")[1]
    // console.log(token)
    if(!token){
        return res.status(401).json({error: "No access token"})
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, user) =>{
        if(err){
            return res.status(403).json({error: "Access token is Invalid"})
        }
        req.user = user.id
        next()
    })
}