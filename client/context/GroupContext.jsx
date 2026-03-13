import { createContext, useContext, useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const GroupChatContext = createContext();

export const GroupChatProvider = ({ children }) => {

    const [groups, setGroups] = useState([]);
    const [groupMessages, setGroupMessages] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [unseenGroupMessages, setUnseenGroupMessages] = useState({});

    const { socket, axios } = useContext(AuthContext);

    // ---------------- GET GROUPS FOR SIDEBAR ----------------

    const getGroups = async () => {
        try {

            const { data } = await axios.get("/api/group/message/groups");

            if (data.success) {
                setGroups(data.groups);
                setUnseenGroupMessages(data.unseenMessages);
            }

        } catch (error) {
            toast.error(error.message);
        }
    };


    // ---------------- GET GROUP MESSAGES ----------------

    const getGroupMessages = async (groupId) => {
        try {

            const { data } = await axios.get(`/api/group/message/${groupId}`);

            if (data.success) {
                setGroupMessages(data.messages);
            }

        } catch (error) {
            toast.error(error.message);
        }
    };


    // ---------------- SEND GROUP MESSAGE ----------------

    const sendGroupMessage = async (messageData) => {
        try {

            const { data } = await axios.post(`/api/group/message/send/${selectedGroup._id}`,messageData);
            console.log(data);
            if(data.success){
                console.log(data.success);
                setGroupMessages((prevMessages)=>[...prevMessages,data.newMessage])
            }

        } catch (error) {
            toast.error(error.message);
        }
    };


    // ---------------- SOCKET SUBSCRIBE ----------------

    const subscribeToGroupMessages = () => {

        if (!socket) return;

        socket.on("newGroupMessage", (newMessage) => {

            if (selectedGroup && newMessage.groupId === selectedGroup._id) {
                newMessage.seen = true;
                setGroupMessages((prevMessages)=>[...prevMessages,newMessage]);
                axios.put(`/api/messages/mark/${newMessage._id}`);

            } else {

                setUnseenGroupMessages((prevUnseenMessages)=>({
                    ...prevUnseenMessages,
                    [newMessage.groupId] : prevUnseenMessages[newMessage.groupId] ? prevUnseenMessages[newMessage.groupId] + 1 : 1
                }))
            }

        });
    };


    // ---------------- SOCKET UNSUBSCRIBE ----------------

    const unsubscribeFromGroupMessages = () => {
        if (socket) socket.off("newGroupMessage");
    };


    // ---------------- EFFECT ----------------

    useEffect(() => {

        subscribeToGroupMessages();

        return () => unsubscribeFromGroupMessages();

    }, [socket, selectedGroup]);


    const value = {
        groups,
        groupMessages,
        selectedGroup,
        unseenGroupMessages,
        setUnseenGroupMessages,
        getGroups,
        getGroupMessages,
        sendGroupMessage,
        setSelectedGroup
    };

    return (
        <GroupChatContext.Provider value={value}>
            {children}
        </GroupChatContext.Provider>
    );
};