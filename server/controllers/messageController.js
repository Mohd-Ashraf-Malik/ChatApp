import cloudinary from "../lib/cloudinary.js";
import Message from "../models/Messages.js";
import User from "../models/User.js";
import { io, userSocketMap } from "../server.js";
import { generateResult } from "../lib/ai.service.js";


// ---------------------- USERS FOR SIDEBAR ----------------------

export const getUsersForSidebar = async (req, res) => {
  try {

    const userId = req.user._id;

    const users = await User.find({ _id: { $ne: userId } }).select("-password");

    const unseenMessages = {};

    await Promise.all(
      users.map(async (user) => {

        const count = await Message.countDocuments({
          senderId: user._id,
          receiverId: userId,
          seen: false
        });

        if (count > 0) unseenMessages[user._id] = count;

      })
    );

    res.json({ success: true, users, unseenMessages });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ---------------------- PRIVATE CHAT MESSAGES ----------------------

export const getMessages = async (req, res) => {
  try {

    const { id: selectedUserId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: selectedUserId },
        { senderId: selectedUserId, receiverId: myId }
      ]
    });

    await Message.updateMany(
      { senderId: selectedUserId, receiverId: myId },
      { seen: true }
    );

    res.json({ success: true, messages });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};


// ---------------------- MARK MESSAGE AS SEEN ----------------------

export const markMessageAsSeen = async (req, res) => {
  try {

    const { id } = req.params;

    await Message.findByIdAndUpdate(id, { seen: true });

    res.json({ success: true });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};


// ---------------------- SEND PRIVATE MESSAGE ----------------------

export const sendMessage = async (req, res) => {
  try {

    const { text, image } = req.body;
    const receiverId = req.params.id;
    const senderId = req.user._id;

    let sendtext = text;

    let imageUrl;

    if (image) {
      const upload = await cloudinary.uploader.upload(image);
      imageUrl = upload.secure_url;
    }

    if(text?.startsWith("@ai")){
      const result = await generateResult(text);
      sendtext += "\n\n******** AI RESPONSE ********\n";
      sendtext += result;
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      text: sendtext,
      image: imageUrl
    });

    const receiverSocketId = userSocketMap[receiverId];

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.json({ success: true, newMessage });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};