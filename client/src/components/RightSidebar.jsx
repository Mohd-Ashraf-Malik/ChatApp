import React, { useContext, useState } from 'react'
import { ChatContext } from '../../context/ChatContext'
import { AuthContext } from '../../context/AuthContext';

function RightSidebar() {
   const {selectedUser, messages} = useContext(ChatContext);
   const {logout, onlineUsers} = useContext(AuthContext);
   const {msgImages, setMsgImages} = useState([]);
  return (
    <div>RightSidebar</div>
  )
}

export default RightSidebar