import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
import appointmentRoutes from "./routes/appointments.js"
import authRoutes from "./routes/auth.js"

import authMiddleware from "./middleware/auth.js"


dotenv.config({ quiet: true })

const app = express()


app.use(cors())
app.use(express.json())


app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    })
})
app.get('/api/protected', authMiddleware, async (req, res) => {
    res.json({
        message: "This is a protected route",
        userId: req.userId
    })
})

app.use('/api/appointments', appointmentRoutes)
app.use('/api/auth', authRoutes)
const PORT = process.env.PORT || 5000
console.log("Connecting to DB...");

const startServer = (message = '') => {
    app.listen(PORT, () => {
        console.log(`server running on port ${PORT}${message}`)
    })
}

if (!process.env.MONGO_URL) {
    console.log("DB error: MONGO_URL is not configured")
    startServer(' (DB not connected)')
} else {
    mongoose.connect(process.env.MONGO_URL, {
        serverSelectionTimeoutMS: 5000,
    })
        .then(() => {
            console.log('database connected')
            startServer()
        })
        .catch((err) => {
            console.log("DB error:", err.message)
            console.log("Full error:", err)

            startServer(' (DB not connected)')
        })
}
