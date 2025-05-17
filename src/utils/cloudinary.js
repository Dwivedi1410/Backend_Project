import {v2 as cloudinary} from "cloudinary"
// Imports Cloudinary's Node SDK.

import fs from "fs"
// Used here to delete the local file after uploading it to Cloudinary.This module is built in nodejs.

cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
//         Uploads the file to Cloudinary using their API.
//         resource_type: "auto": Cloudinary automatically detects if it's an image, video, etc.

        console.log("File is uploaded on this URL: ", response.url)

        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath)
        return null
    }
}

export {uploadOnCloudinary}