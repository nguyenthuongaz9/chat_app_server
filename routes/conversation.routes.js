import { Router } from 'express'
import { verifyToken } from "../middlewares/auth.middleware.js"
import { createConversation, deleteConversation, getAllConversations, getConversationById } from '../controllers/conversation.controllers.js'
const conversationRoutes = Router()

conversationRoutes.get('/',verifyToken, getAllConversations)
conversationRoutes.post('/', verifyToken, createConversation)
conversationRoutes.get('/:conversationId',verifyToken, getConversationById)
conversationRoutes.delete('/:conversationId',verifyToken, deleteConversation)

export default conversationRoutes