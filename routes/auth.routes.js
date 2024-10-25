
import { Router } from "express"
import { checkAuth, login, logout, register, resendVerificationToken, verifyEmail } from "../controllers/auth.controllers.js"
import { verifyToken } from "../middlewares/auth.middleware.js"


const authRoutes = Router()

authRoutes.post('/login', login)

authRoutes.post('/register', register)
authRoutes.post('/verify-email', verifyEmail);
authRoutes.get('/check-auth', verifyToken, checkAuth);
authRoutes.post('/resend-verification-code', resendVerificationToken);
authRoutes.post('/logout', logout)




export default authRoutes