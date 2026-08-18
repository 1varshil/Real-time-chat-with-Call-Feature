import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

const uploadOnCloudinary = async (FilePath) => {
    try {
        if (!FilePath) return null;

        const uploadResult = await cloudinary.uploader.upload(FilePath, {
            resource_type: "auto"
        });

        if (uploadResult.secure_url) {
            fs.unlinkSync(FilePath);
            return uploadResult.secure_url;
        }
        return null;
    } catch (error) {
        if (fs.existsSync(FilePath)) {
            fs.unlinkSync(FilePath);
        }
        console.error("Something went wrong while uploading file on cloudinary:", error);
        return null;
    }
}

export default uploadOnCloudinary;