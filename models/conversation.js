
import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
  participants: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], 
    required: true,
  },
  isGroup: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Conversation = mongoose.model("Conversation", conversationSchema);
export default Conversation;
