import jwt from 'jsonwebtoken'

export const verifyToken = (req, res, next) => {
    const token = req.cookies.token;

    console.log('Cookies:', req.cookies); // Kiểm tra giá trị cookies
    console.log('Token:', token); // Kiểm tra giá trị token

    if (!token) {
        return res.status(401).json({ success: false, message: "Unauthorized - no token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        console.log('Decoded Token:', decoded); // Kiểm tra giá trị decoded
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: "Unauthorized - token expired" });
        }
        console.log("Error in verifyToken ", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

