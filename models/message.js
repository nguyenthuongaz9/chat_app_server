



import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  fileUrl: {
    type: String,
    default: null,
    required: false,
  },

});

const Message = mongoose.model("Message", messageSchema);
export default Message;
