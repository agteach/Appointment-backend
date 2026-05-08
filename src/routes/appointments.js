import express from 'express';
import mongoose from 'mongoose';
import Appointment from '../models/Appointment.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

const sanitizeAppointmentPayload = (payload = {}) => {
    const sanitized = {};

    if (payload.title !== undefined) {
        sanitized.title = String(payload.title).trim();
    }

    if (payload.description !== undefined) {
        sanitized.description = String(payload.description).trim();
    }

    if (payload.date !== undefined) {
        sanitized.date = payload.date;
    }

    if (payload.time !== undefined) {
        sanitized.time = String(payload.time).trim();
    }

    if (payload.duration !== undefined) {
        sanitized.duration = payload.duration;
    }

    if (payload.status !== undefined) {
        sanitized.status = payload.status;
    }

    return sanitized;
};

router.get('/', authMiddleware, async (req, res) => {
    try {
        const appointments = await Appointment
            .find({ user: req.userId })
            .sort({ date: 1, time: 1 });

        res.json(appointments);

    } catch (error) {
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
});

router.post('/', authMiddleware, async (req, res) => {
    try {
        const { title, description, date, time, duration, status } = sanitizeAppointmentPayload(req.body);

        if (!title || !date || !time) {
            return res.status(400).json({
                message: 'Title, date, and time are required'
            });
        }

        const appointment = await Appointment.create({
            user: req.userId,
            title,
            description,
            date,
            time,
            duration,
            status
        });

        res.status(201).json(appointment);

    } catch (error) {

        if (error.code === 11000) {
            return res.status(400).json({
                message: "Time slot already booked"
            });
        }

        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
});
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: 'Invalid appointment id'
            });
        }

        const updates = sanitizeAppointmentPayload(req.body);

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                message: 'No valid appointment fields provided'
            });
        }

        const updated = await Appointment.findOneAndUpdate(
            { _id: req.params.id, user: req.userId },
            updates,
            { new: true, runValidators: true }
        );

        if (!updated) {
            return res.status(404).json({
                message: 'Not found or not yours'
            });
        }

        res.json(updated);

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                message: "Time slot already booked"
            });
        }

        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
});

router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: 'Invalid appointment id'
            });
        }

        const deleted = await Appointment.findOneAndDelete({
            _id: req.params.id,
            user: req.userId
        });

        if (!deleted) {
            return res.status(404).json({
                message: 'Not found or not yours'
            });
        }

        res.json({ message: 'Deleted successfully' });

    } catch (error) {
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
});


export default router;