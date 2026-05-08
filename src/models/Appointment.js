import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true,
        match: [/^\d{2}:\d{2}$/, "Use HH:mm format"]
    },
    duration: {
        type: Number,
        default: 60,
        min: 1
    },
    status: {
        type: String,
        enum: ['scheduled', 'confirmed', 'completed', 'cancelled'],
        default: 'scheduled'
    }
}, { timestamps: true });

appointmentSchema.index({ user: 1, date: 1, time: 1 }, { unique: true });

export default mongoose.model('Appointment', appointmentSchema);
