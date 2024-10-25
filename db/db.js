import mongoose from "mongoose";


const connectDB = async ()=> {
    try {
        const conn = await mongoose.connect(process.env.DATABASE_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000, // Thời gian chờ cho việc chọn server
            socketTimeoutMS: 45000 // Thời gian chờ cho socket
        });
        
        console.log(`MongoDB Connected: ${conn.connection.host}`);       
    } catch (error) {
        console.error(error);
        return error
    }
}


export default connectDB;