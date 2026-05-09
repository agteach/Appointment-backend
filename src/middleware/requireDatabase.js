import mongoose from "mongoose";

const requireDatabase = (req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
            message: "Database is unavailable. Please try again shortly."
        });
    }

    next();
};

export default requireDatabase;
