import jwt from "jsonwebtoken";

const isAuth = async (req,res,next) => {
    try {
        console.log("Cookies in isAuth Middleware:", req.cookies);
        let token = req.cookies.token;
        if(!token){
            return res.status(401).json({message: "Not Logged In"});
        }
        let verifyToken = await jwt.verify(token,process.env.JWT_SECRET);
        req.userId = verifyToken.id;  
        console.log("Authenticated User ID in middleware :", req.userId);
        next();
       
    } catch (error) {
        return res.status(500).json({message: `isAuth Middleware Error : ${error.message}`});
    }
}

export default isAuth;