import Conversation from "../models/conversation.js";
import Message from "../models/message.js";
import mongoose from "mongoose";

export const getAllConversations = async (req, res, next) => {
    try {
        const userId = req.userId;
        const cursor = parseInt(req.query.cursor) || 1;
        const limit = parseInt(req.query.limit) || 10;

        if (!userId) {
            return res.status(401).send({ message: "Unauthorized" });
        }

        const conversations = await Conversation.find({ participants: userId })
            .skip((cursor - 1) * limit)
            .limit(limit)
            .populate('participants', 'firstName lastName imageUrl');

        const conversationIds = conversations.map(conversation => conversation._id);

        const lastMessages = await Message.aggregate([
            { $match: { conversationId: { $in: conversationIds } } },
            { $sort: { createdAt: -1 } }, 
            {
                $group: {
                    _id: "$conversationId", 
                    lastMessage: { $first: "$$ROOT" } 
                }
            }
        ]);


        const lastMessageMap = lastMessages.reduce((acc, message) => {
            acc[message._id] = message.lastMessage;
            return acc;
        }, {});

        const conversationsWithLastMessages = conversations.map(conversation => ({
            ...conversation.toObject(),
            lastMessage: lastMessageMap[conversation._id] || null
        }));

        const totalConversations = await Conversation.countDocuments({ participants: userId });
        const hasNextPage = totalConversations > (cursor * limit);

        return res.status(200).send({
            success: true,
            conversations: conversationsWithLastMessages,
            nextCursor: hasNextPage ? cursor + 1 : null,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "INTERNAL ERROR", error: error });
    }
};


export const createConversation = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { otherUsers, title, isGroup } = req.body;

        const existingConversation = await Conversation.findOne({
            title: title
        })

        if(existingConversation){
            return res.status(400).json({message: 'Conversation has already in the app'})
        }

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const participants = [new mongoose.Types.ObjectId(userId)];

        if (isGroup === true) {
            const parsedOtherUsers = Array.isArray(otherUsers) ? otherUsers : JSON.parse(otherUsers);

            if (!Array.isArray(parsedOtherUsers) || parsedOtherUsers.length === 0) {
                return res.status(400).json({ message: "Group members are required to create a group conversation." });
            }

            participants.push(...parsedOtherUsers.map(id => new mongoose.Types.ObjectId(id)));
        } else {
            if (!otherUsers || typeof otherUsers !== "string") {
                return res.status(400).json({ message: "Other user is required to create a conversation." });
            }
            participants.push(new mongoose.Types.ObjectId(otherUsers));
        }

        const newConversation = await Conversation.create({
            participants,
            title: title || "",
            isGroup: isGroup || false
        });

        return res.status(201).json({
            conversation: newConversation
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "INTERNAL ERROR", error: error.message });
    }
};



export const deleteConversation = async (req, res) => {
    try {
        const conversationId = req.params.conversationId;

        const conversation = await Conversation.findByIdAndDelete(conversationId);

        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found" });
        }
        return res.status(200).json({ message: "Conversation deleted successfully" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "INTERNAL ERROR", error: error.message });
    }
}


export const getConversationById = async (req, res) => {
    try {
        const conversationId = req.params.conversationId


        const conversation = await Conversation.findById(conversationId).populate('participants', 'firstName lastName imageUrl');


        return res.status(200).json({
            conversation: conversation
        })
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: "INTERNAL ERROR", error: error.message });
    }
}