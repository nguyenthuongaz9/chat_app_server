

import { Router } from 'express';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { getMessage, createMessage } from '../controllers/messenger.controller.js'
import multer from 'multer';


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/messages');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '_' + file.originalname)
    }
})


const upload = multer({ storage: storage })
const messageRoutes = Router();

const initMessageRoutes = (io) => {
    messageRoutes.get('/', verifyToken, getMessage);
    messageRoutes.post('/', verifyToken, upload.single('file'), createMessage(io));


    return messageRoutes;
};

export default initMessageRoutes;
