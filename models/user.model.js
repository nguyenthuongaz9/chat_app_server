import mongoose  from "mongoose"



const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: false
    },
    lastName: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    imageUrl: {
        type: String,
        required: false
    },
    hashedPassword: {
        type: String,
        required: true
    },
    lastLogin:{
        type: Date,
        default: Date.now
    },
    isSetupProfile:{
        type: Boolean,
        default: false
    },
    isVerify:{
        type: Boolean,
        default: false
    },
    resetPasswordToken: {
        type: String,
        default: null
    },
    resetPasswordExpiresAt: {
        type: Date,
        default: null
    },
    verificationCodeExpires:{
        type: Date,
        default: null
    },
    verificationCode: {
        type: String,
        default: null
    },
    verifycationToken: {
        type: String,
        default: null
    },
    verifycationTokenExpiresAt: {
        type: Date,
        default: null
    },
    


},{timestamps: true})



const User = mongoose.model("User", userSchema)

export default User