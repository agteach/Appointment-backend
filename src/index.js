import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
import appointmentRoutes from "./routes/appointments.js"
import authRoutes from "./routes/auth.js"

import authMiddleware from "./middleware/auth.js"


dotenv.config({ quiet: true })

const app = express()


app.use(
    cors({
        origin: "https://appointment-management-beta.vercel.app",
        credentials: true,
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

    })
}

if (!process.env.MONGO_URL) {

    startServer(' (DB not connected)')
} else {
    mongoose.connect(process.env.MONGO_URL, {
        serverSelectionTimeoutMS: 5000,
    })
        .then(() => {
            startServer()
        })
        .catch((err) => {

            startServer(' (DB not connected)')
        })
}
