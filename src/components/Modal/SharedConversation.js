import React, { useEffect, useState } from "react";
import { getSharePost, setOpenChart } from "../redux/chatReducer";
import { useDispatch, useSelector } from "react-redux";
import styles from "./SharedConversation.module.css";
import axios from "axios";
import { useUser } from "@clerk/clerk-react";
import Spinner from "../UI/Spinner";
import { useNavigate } from "react-router-dom";

const SharedConversation = ({ conversationUserId, id, postId }) => {
  const [conversationUser, setConversationUser] = useState(null);
  const dispatch = useDispatch();
  const { user } = useUser();
  const socket = useSelector((state) => state.socket.socket);
  const openChat = useSelector((state) => state.chat.openChat);
  const conversationId = useSelector((state) => state.chat.conversationId);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  const handleClick = async () => {
    const data = {
      sender: user.id,
      conversationId: id,
      postId: postId,
    };

    socket.emit("sendMessage", {
      senderId: user.id,
      receiverId: conversationUserId,
      postId,
      conversationId: id,
    });

    try {
      const res = await axios.post(
        "https://social-app-backend-idrz.onrender.com/message",
        data
      );
      if (!openChat) {
        dispatch(
          setOpenChart({
            openChat: true,
            id: id,
            conversationUser: conversationUser,
          })
        );
        if (window.innerWidth <= 768) {
          navigate(`/chatBox/${id}`);
        }
      } else if (openChat && id === conversationId) {
        dispatch(getSharePost(res.data));
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const getConversationUser = async () => {
      try {
        const res = await axios.get(
          `https://social-app-backend-idrz.onrender.com/user/${conversationUserId}`
        );
        setConversationUser(res.data);
        setIsLoading(false);
      } catch (err) {
        console.log(err);
      }
    };
    getConversationUser();
  }, [conversationUserId]);
  return (
    <>
      {!isLoading && (
        <div className={styles.container} onClick={handleClick}>
          <div className={styles.postHeader}>
            <div className={styles.imageContainer}>
              <img
                className={styles.profilePicture}
                src={conversationUser?.profile_img}
                alt="User Profile"
              />
            </div>
            <div className={styles.userInfo}>
              <p className={styles.displayName}>{conversationUser?.fullname}</p>
            </div>
          </div>
        </div>
      )}
      {isLoading && (
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <Spinner />
        </div>
      )}
    </>
  );
};

export default SharedConversation;
