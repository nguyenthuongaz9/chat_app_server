import mongoose from "mongoose";


const connectDB = async ()=> {
    try {
        const conn = await mongoose.connect(process.env.DATABASE_URL);
        console.log(`MongoDB Connected: ${conn.connection.host}`);       
    } catch (error) {
        console.error(error);
        return error
    }
}


export default connectDB;