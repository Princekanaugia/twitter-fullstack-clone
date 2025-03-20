import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js"

dotenv.config()

const app = express()
console.log(process.env.MONGO_URI)

app.use("/api/auth", authRoutes);

app.get("/", (req,res) => {
    res.send("server is ready")
})



app.listen(8000, () => {
    console.log("Server is running on port 8000")
}) 