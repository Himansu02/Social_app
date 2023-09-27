import React, { useEffect, useState } from "react";
import styles from "./UserList.module.css";
import User from "./User";
import { useDispatch, useSelector } from "react-redux";
import { useUser } from "@clerk/clerk-react";
import {
  getList,
  getNewConversation,
  getNotificationId,
  reArrangeList,
} from "../redux/chatReducer";
import axios from "axios";
import Spinner from "../UI/Spinner";

function UserList({ searchName }) {
  const conversations = useSelector((state) => state.chat.userMessageList);
  const { user } = useUser();
  // const [allConversations, setAllConversations] = useState([]);
  const openChat = useSelector((state) => state.chat.openChat);

  // useEffect(() => {
  //   setAllConversations(conversations);
  // }, [conversations]);

  const socket = useSelector((state) => state.socket.socket);

  const dispatch = useDispatch();

  useEffect(() => {
    const handleReceivedMessage = (data) => {
      const existingChatIndex = conversations.findIndex((conv) => {
        console.log(conv);
        return conv._id === data.conversationId;
      });

      console.log(existingChatIndex);

      const receiveData = {
        sender: data.senderId,
        text: data.text,
        postId: data.postId,
      };

      dispatch(
        getNotificationId({
          id: data.conversationId,
          message: receiveData,
        })
      );

      if (existingChatIndex !== -1) {
        console.log("exist");
        const updatedChatList = [...conversations];
        const updatedChat = { ...updatedChatList[existingChatIndex] };
        updatedChatList.splice(existingChatIndex, 1); // Remove the existing chat
        updatedChatList.unshift(updatedChat); // Add the updated chat to the top

        dispatch(getList(updatedChatList));
      } else {
        console.log("not");
        const getConversation = async () => {
          try {
            const res = await axios.get(
              `https://social-app-backend-idrz.onrender.com/conversation/one/${data.conversationId}`
            );
            dispatch(getNewConversation(res.data));
          } catch (err) {
            console.log(err);
          }
        };
        getConversation();
      }
    };
    socket.on("getMessage", handleReceivedMessage);

    return () => {
      socket.off("getMessage", handleReceivedMessage);
    };
  }, []);

  return (
    <div className={styles.userList}>
      {conversations.map((conversation, idx) => {
        // console.log(conversation)
        const conversationUserId =
          conversation.members[0] === user.id
            ? conversation.members[1]
            : conversation.members[0];
        return (
          <User
            key={idx}
            conversationUserId={conversationUserId}
            id={conversation._id}
          />
        );
      })}
    </div>
  );
}

export default UserList;
