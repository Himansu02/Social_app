import React, { useEffect, useState } from "react";
import styles from "./User.module.css";
import { useDispatch, useSelector } from "react-redux";
import { reArrangeList, setOpenChart } from "../redux/chatReducer";
import axios from "axios";
import { useUser } from "@clerk/clerk-react";
import Spinner from "../UI/Spinner";
import { useNavigate } from "react-router-dom";

const User = ({ conversationUserId, id }) => {
  // console.log(conversation)

  const [conversationUser, setConversationUser] = useState(null);
  const [lastMessage, setLastMessage] = useState(null);
  const socket = useSelector((state) => state.socket.socket);
  const notificationIds = useSelector((state) => state.chat.notificationIds);
  const [notificationMessage, setNotificationMessage] = useState(null);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const getNotifications = () => {
    const notification = notificationIds?.find((n) => n.id === id);
    if (notification) {
      const msg = notification?.messages[notification?.messages.length - 1];
      setNotificationMessage(msg);
      setCount(notification?.messages.length);
    }
  };
  useEffect(() => {
    getNotifications();
  }, [notificationIds]);

  const { user } = useUser();

  const dispatch = useDispatch();

  const handleClick = () => {
    setNotificationMessage(null);
    setCount(0);

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

  useEffect(() => {
    const getLastMessage = async () => {
      try {
        const res = await axios.get(
          `https://social-app-backend-idrz.onrender.com/message/${id}/lastmessage`
        );
        // console.log(res.data.sender);
        // console.log(user.id);
        setLastMessage(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    getLastMessage();
  }, [id]);

  // useEffect(() => {
  //   socket.on("getMessage", (data) => {
  //     if (data.conversationId === id) {
  //       const receiveData = {
  //         sender: data.senderId,
  //         text: data.text,
  //         postId:data.postId,
  //       };
  //       setCount((prev)=>{
  //         return prev+1
  //       })
  //       setNotificationMessage(receiveData);
  //     }
  //   });
  // }, []);

  return (
    <>
      {!isLoading && (
        <div className={styles.user} onClick={handleClick}>
          <div className={styles.leftContainer}>
            <div className={styles.imgContainer}>
              <img className={styles.img} src={conversationUser?.profile_img} />
            </div>
            <div className={styles.text}>
              <p className={styles.name}>{conversationUser?.fullname}</p>
              {!notificationMessage &&
                lastMessage?.text &&
                lastMessage?.sender === user.id && (
                  <p className={styles.msg}>Sent : {lastMessage?.text}</p>
                )}
              {!notificationMessage &&
                lastMessage?.text &&
                lastMessage?.sender !== user.id && (
                  <p className={styles.msg}>Received : {lastMessage?.text}</p>
                )}
              {!notificationMessage &&
                lastMessage?.postId &&
                lastMessage?.sender === user.id && (
                  <p className={styles.msg}>Sent : shared a post</p>
                )}
              {!notificationMessage &&
                lastMessage?.postId &&
                lastMessage?.sender !== user.id && (
                  <p className={styles.msg}>Received : sent a post</p>
                )}
              {notificationMessage &&
                notificationMessage?.text &&
                notificationMessage?.sender === user.id && (
                  <p className={styles.notifyMsg}>
                    Sent : {notificationMessage?.text}
                  </p>
                )}
              {notificationMessage &&
                notificationMessage?.text &&
                notificationMessage?.sender !== user.id && (
                  <p className={styles.notifyMsg}>
                    Received : {notificationMessage?.text}
                  </p>
                )}
              {notificationMessage &&
                notificationMessage?.postId &&
                notificationMessage?.sender === user.id && (
                  <p className={styles.notifyMsg}>Sent : shared a post</p>
                )}
              {notificationMessage &&
                notificationMessage?.postId &&
                notificationMessage?.sender !== user.id && (
                  <p className={styles.notifyMsg}>Received : sent a post</p>
                )}
            </div>
          </div>
          {notificationMessage && (
            <div className={styles.count}>
              <span>{count}</span>
            </div>
          )}
        </div>
      )}
      {isLoading && (
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            marginTop: "50px",
          }}
        >
          <Spinner />
        </div>
      )}
    </>
  );
};

export default User;
