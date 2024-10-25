
import { Router } from 'express'
import { createProfile , editProfile, getAllUsers } from '../controllers/user.controllers.js'

import { verifyToken } from '../middlewares/auth.middleware.js'
import  multer  from 'multer'


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/profiles');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    },
})


const upload = multer({ storage: storage });

const userRoutes = Router()
  



userRoutes.post('/', verifyToken ,upload.single('file') ,createProfile)
userRoutes.post('/:userId', verifyToken, upload.single('image'), editProfile);
userRoutes.get('/', verifyToken, getAllUsers)


export default userRoutes