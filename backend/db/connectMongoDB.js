import mongoose from "mongoose";

const connectMongoDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI)
        console.log(`MongoDB connection ${conn.connection.host}`)
    } catch (error) {
        console.log(`Error connecting to MongoDB : ${error.messsage}`)
        process.exit(1)
    }
}

export default connectMongoDB;