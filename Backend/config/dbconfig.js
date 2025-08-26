const mongoose = require ('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const connectDb = async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI)
        console.log('MongoDB connected successfully');
    }
    catch(error){
        console.log(`Error: ${error.message}`);
        
    }
}

module.exports = {connectDb}