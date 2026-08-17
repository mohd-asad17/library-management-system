import { verifyToken }  from "../utils/jwt.js";

const authenticateUser = (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const decoded = verifyToken(token);
        req.user = decoded;

        next();
    } catch (error) {
        console.log("Authentication error", error.message);
        return res.status(401).json({
            success: false,
            message: "Invalid or expired authentication token",
        });
    }
};

export default authenticateUser;