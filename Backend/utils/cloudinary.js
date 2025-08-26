const { v2: cloudinary } = require('cloudinary');
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();



cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary = async(localFilePath) => {
    try{
        if(!localFilePath) return null;

        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type: 'auto'
        })
        console.log("file uploaded on cloudinary", response.url);
        fs.unlinkSync(localFilePath); // Delete the file after uploading

        return response

    }catch(error){
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}

module.exports = uploadOnCloudinary;