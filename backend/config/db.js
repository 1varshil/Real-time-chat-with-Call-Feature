import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("db connected:");
    }
    catch (err) {
        console.error('err is look like :', err);
    }
}

export default connectDb;