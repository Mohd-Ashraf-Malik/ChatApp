import cloudinary from "../lib/cloudinary.js";
import Group from "../models/Group.js";
import Message from "../models/Messages.js";
import { io, userSocketMap } from "../server.js";
import {generateResult} from '../lib/ai.service.js'

export const createGroup = async (req,res)=>{
    try{

        const {name, members} = req.body;

        const admin = req.user._id;

        const group = await Group.create({
            name,
            admin,
            members:[admin, ...members]
        });

        res.json({
            success:true,
            group
        });

    }catch(error){
        res.json({
            success:false,
            message:error.message
        });
    }
}

export const addMemberToGroup = async (req, res) => {
  try {

    const { groupId } = req.params;
    const { userId } = req.body;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.json({
        success:false,
        message:"Group not found"
      });
    }

    // Only admin can add members
    if(group.admin.toString() !== req.user._id.toString()){
      return res.json({
        success:false,
        message:"Only admin can add members"
      });
    }

    await Group.findByIdAndUpdate(
      groupId,
      {
        $addToSet:{ members:userId }
      }
    );

    res.json({
      success:true,
      message:"User added to group"
    });

  } catch (error) {
    res.json({
      success:false,
      message:error.message
    });
  }
};

export const makeAdmin = async (req, res) => {
  try {

    const { groupId } = req.params;
    const { userId } = req.body;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.json({
        success:false,
        message:"Group not found"
      });
    }

    // Only current admin can assign new admin
    if(group.admin.toString() !== req.user._id.toString()){
      return res.json({
        success:false,
        message:"Only admin can change admin"
      });
    }

    // check user is member of group
    if(!group.members.includes(userId)){
      return res.json({
        success:false,
        message:"User is not a group member"
      });
    }

    await Group.findByIdAndUpdate(
      groupId,
      { admin: userId }
    );

    res.json({
      success:true,
      message:"Admin updated successfully"
    });

  } catch (error) {
    res.json({
      success:false,
      message:error.message
    });
  }
};



// ---------------------- GROUPS FOR SIDEBAR ----------------------

export const getGroupsForSidebar = async (req, res) => {
    try {
  
      const userId = req.user._id;
  
      const groups = await Group.find({ members: userId });
  
      const unseenMessages = {};
  
      await Promise.all(
        groups.map(async (group) => {
  
          const count = await Message.countDocuments({
            groupId: group._id,
            seen: false
          });
  
          if (count > 0) unseenMessages[group._id] = count;
  
        })
      );
  
      res.json({ success: true, groups, unseenMessages });
  
    } catch (error) {
      res.json({ success: false, message: error.message });
    }
  };



  // ---------------------- GROUP MESSAGES ----------------------

  export const getMessagesFromGroup = async (req, res) => {
    try {
  
      const { groupId } = req.params;
  
      const messages = await Message.find({ groupId })
      .populate("senderId", "fullName profilePic"); 
  
      await Message.updateMany(
        { groupId, senderId: { $ne: req.user._id } },
        { seen: true }
      );
  
      res.status(200).json({
        success: true,
        messages
      });
  
    } catch (error) {
  
      res.status(500).json({
        success: false,
        message: error.message
      });
  
    }
  };
  


  // ---------------------- SEND GROUP MESSAGE ----------------------

  export const sendMessageGroup = async (req, res) => {
    try {
  
      const { text, image } = req.body;
      const { groupId } = req.params;
      const senderId = req.user._id;
  
      let sendtext = text;

      let imageUrl;

      if(image){
        const upload = await cloudinary.uploader.upload(image);
        imageUrl = upload.secure_url;
      }

      if(text?.startsWith("@ai")){
        const result = await generateResult(text);
        sendtext += "\n\n******** AI RESPONSE ********\n";
        sendtext += result;
      }
  
      let newMessage = await Message.create({
        senderId,
        groupId,
        text: sendtext,
        image: imageUrl
      })

      newMessage = await newMessage.populate("senderId", "fullName profilePic");
  
      const group = await Group.findById(groupId);
  
      group.members.forEach(memberId => {
  
        const socketId = userSocketMap[memberId.toString()];
  
        if (socketId && memberId.toString() !== senderId.toString()) {
          io.to(socketId).emit("newGroupMessage", newMessage);
        }
  
      });
  
      res.json({ success: true, newMessage });
  
    } catch (error) {
      res.json({ success: false, message: error.message });
    }
  };