import express from "express";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes.js"
import connectMongoDB from "./db/connectMongoDB.js";

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

console.log(process.env.MONGO_URI)

app.use("/api/auth", authRoutes);

app.get("/", (req,res) => {
    res.send("server is ready")
})



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
    connectMongoDB();
}) 