import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
import appointmentRoutes from "./routes/appointments.js"
import authRoutes from "./routes/auth.js"

import authMiddleware from "./middleware/auth.js"


dotenv.config({ quiet: true })
mongoose.set("bufferCommands", false)

const app = express()

const normalizeOrigin = (value = "") => value.trim().replace(/\/+$/, "")

const allowedOrigins = (process.env.ALLOWED_ORIGINS || process.env.CORS_ORIGIN || "")
    .split(",")
    .map(normalizeOrigin)
    .filter(Boolean)

const isOriginAllowed = (origin) => {
    if (!origin) {
        return true
    }

    if (allowedOrigins.length === 0) {
        return true
    }

    return allowedOrigins.includes(normalizeOrigin(origin))
}

app.use(
    cors({
        origin: (origin, callback) => {
            if (isOriginAllowed(origin)) {
                return callback(null, true)
            }

            return callback(new Error(`Origin ${origin} is not allowed by CORS`))
        },
    }),
);
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


const startServer = (message = '') => {
    app.listen(PORT, () => {
        console.log(`server running on port ${PORT}${message}`)
    })
}

const connectToDatabase = async () => {
    if (!process.env.MONGO_URL) {
        console.log("MONGO_URL is not configured")
        return
    }

    try {
        await mongoose.connect(process.env.MONGO_URL, {
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 5000,
        })
        console.log("database connected")
    } catch (err) {
        console.error("database connection failed:", err.message)
    }
}

mongoose.connection.on('disconnected', () => {
    console.warn('database disconnected')
})

mongoose.connection.on('error', (error) => {
    console.error('database error:', error.message)
})

startServer(mongoose.connection.readyState === 1 ? '' : ' (DB connecting)')
void connectToDatabase()
