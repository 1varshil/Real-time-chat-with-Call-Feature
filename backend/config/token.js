import jwt from "jsonwebtoken";
const genToken = async (id) => {
    try {
        const ttoken = jwt.sign({id},process.env.JWT_SECRET,{expiresIn :"2d"});
        return ttoken;
    } catch (error) {
        console.log("error in gen token:", error);
    }
};

export default genToken;