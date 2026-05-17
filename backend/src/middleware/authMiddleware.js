import jwt from "jsonwebtoken";

export const authenticateToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.split(' ')[1] || authHeader;

        if (!token) {
            return res.status(401).json({
                success: false,
                error: "No token provided"
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || "your-secret-key-change-this-in-production"
        );

        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            error: "Invalid or expired token"
        });
    }
};

export const authorizeRole = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: "Access denied. Insufficient permissions."
            });
        }
        next();
    };
};
