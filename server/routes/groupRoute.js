import express from "express";
import { protectRoute } from "../middleware/auth.js";
import { addMemberToGroup, createGroup, getGroupsForSidebar, getMessagesFromGroup, sendMessageGroup } from "../controllers/groupController.js";

const groupRouter = express.Router();

// add member to group hence to groupId
groupRouter.post("/add/:groupId", protectRoute, addMemberToGroup);

// create a group and hence groupId
groupRouter.post("/create", protectRoute, createGroup);

// get groups for sidebar
groupRouter.get("/message/groups", protectRoute, getGroupsForSidebar);

// get messages of a group
groupRouter.get("/message/:groupId", protectRoute, getMessagesFromGroup);

// send message to group
groupRouter.post("/message/send/:groupId", protectRoute, sendMessageGroup);

export default groupRouter;