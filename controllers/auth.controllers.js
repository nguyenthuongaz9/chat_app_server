import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import User from '../models/user.model.js';
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

const generateToken = (res, userId) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '3d' })

    console.log(token)

    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
    })

    return token;

}

const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000);
};

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
    }
})


const sendVerificationEmail = async (user, code) => {
    const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: user.email,
        subject: 'Xác thực email của bạn',
        text: `Mã xác thực của bạn là: ${code}`,
        html: `<p>Mã xác thực của bạn là: <strong>${code}</strong></p>`
    };

    await transporter.sendMail(mailOptions);
};


export const register = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationCode = generateVerificationCode();
        const verificationCodeExpires = new Date(Date.now() + 5 * 60 * 1000);

        const newUser = await User.create({
            email,
            hashedPassword,
            verificationCode,
            verificationCodeExpires
        });


        await sendVerificationEmail(newUser,verificationCode)
        generateToken(res, newUser._id);
        return res.status(201).json({
            success: true,
            message: 'User registered successfully. Please verify your email.',
            user: {
                id: newUser._id,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email,
                isVerify: newUser.isVerify,
                isSetupProfile: newUser.isSetupProfile,
                imageUrl: newUser.imageUrl,
            }
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const logout = (req, res) => {
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0),
        secure: process.env.NODE_ENV === 'production',
        sameSite: "strict",
    })
    return res.status(200).json({ message: 'Logout thành công' });
}

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(400).json({ message: 'user not found' });
        }

        const isMatch = await bcrypt.compare(password, existingUser.hashedPassword);

        if (!isMatch) {
            return res.status(400).json({ message: 'password not match' });
        }

        generateToken(res, existingUser._id)

        return res.status(200).json({
            user: {
                id: existingUser._id,
                firstName: existingUser.firstName,
                lastName: existingUser.lastName,
                email: existingUser.email,
                isVerify: existingUser.isVerify,
                isSetupProfile: existingUser.isSetupProfile,
                imageUrl: existingUser.imageUrl,
            }
        })

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const verifyEmail = async (req, res) => {
    const { email, code } = req.body;

    if (!code || !email) {
        return res.status(400).json({ message: 'Vui lòng cung cấp email và mã xác thực' });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'Email không tồn tại' });
        }

        if (user.isVerify) {
            return res.status(400).json({ message: 'Email đã được xác thực' });
        }

        const now = new Date();
        if (parseInt(user.verificationCode) !== parseInt(code)) {
            return res.status(400).json({ message: 'Mã xác thực không đúng' });
        }

        if (now > user.verificationCodeExpires) {
            return res.status(400).json({ message: 'Mã xác thực đã hết hạn' });
        }

        user.isVerify = true;
        user.verificationCode = null;
        user.verificationCodeExpires = null; 
        await user.save();

        res.status(200).json({ message: 'Xác thực email thành công' });

    } catch (error) {
        res.status(500).json({ message: 'Lỗi máy chủ', error });
    }
};

export const resendVerificationToken = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Email không tồn tại' });
        }

        if (user.isVerify) {
            return res.status(400).json({ message: 'Email đã được xác thực' });
        }

        const newVerificationCode = generateVerificationCode();
        user.verificationCode = newVerificationCode;
        await user.save();

        await sendVerificationEmail(user, newVerificationCode); 

        return res.status(200).json({ message: 'Mã xác thực đã được gửi lại' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
export const checkAuth = async (req, res) => {
    try {

        const user = await User.findById(req.userId).select("-password");
        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        res.status(200).json({
            success: true, user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                isVerify: user.isVerify,
                isSetupProfile: user.isSetupProfile,
                imageUrl: user.imageUrl,
            }
        });
    } catch (error) {
        console.log("Error in checkAuth ", error);
        res.status(400).json({ success: false, message: error.message });
    }
};

