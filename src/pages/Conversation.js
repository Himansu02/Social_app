import { KeyboardBackspace, Send, Videocam } from "@mui/icons-material";
import React, { useEffect, useRef, useState } from "react";
import styles from "./Conversation.module.css";
import { useDispatch, useSelector } from "react-redux";
import {
  getList,
  getNewConversation,
  getNotificationId,
  getSharePost,
  setCloseChat,
  setOpenChart,
} from "../components/redux/chatReducer";
import axios from "axios";
import { useUser } from "@clerk/clerk-react";
import { Link, useNavigate } from "react-router-dom";
import SingleMessage from "../components/main/SingleMessage";
import InfiniteScroll from "react-infinite-scroll-component";
import LoadingSpinner from "../components/UI/LoadingSpinner";
import Spinner from "../components/UI/Spinner";

const Conversation = (props) => {
  const conversationId = useSelector((state) => state.chat.conversationId);
  const conversationUser = useSelector((state) => state.chat.conversationUser);
  const dispatch = useDispatch();
  const [conversationMessage, setConversationMessage] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const sharePostContent = useSelector((state) => state.chat.sharePostContent);
  const [isLoading, setIsLoading] = useState(true);

  const conversations = useSelector((state) => state.chat.userMessageList);

  const messageContainerRef = useRef();

  const socket = useSelector((state) => state.socket.socket);
  const navigate = useNavigate();

  const handleClick = () => {
    dispatch(setCloseChat());
    if (window.innerWidth <= 768) {
      navigate("/chatBox");
    }
  };

  const { user } = useUser();

  const scrollRef = useRef(null);

  const existingChatIndex = conversations.findIndex((conv) => {
    console.log(conv);
    return conv._id === conversationId;
  });

  useEffect(() => {
    socket.on("getMessage", (data) => {
      setArrivalMessage({
        conversationId,
        sender: data.senderId,
        text: data.text ? data.text : null,
        postId: data.postId ? data.postId : null,
        createdAt: Date.now(),
      });
    });
  }, []);

  useEffect(() => {
    const handleReceivedMessage = (data) => {
      if (data.conversationId !== conversationId) {
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
      }
      return;
    };
    socket.on("getMessage", handleReceivedMessage);

    return () => {
      socket.off("getMessage", handleReceivedMessage);
    };
  }, []);

  useEffect(() => {
    arrivalMessage?.sender === conversationUser?.externalId &&
      setConversationMessage((prev) => {
        return [...prev, arrivalMessage];
      });
  }, [arrivalMessage, conversationUser]);

  useEffect(() => {
    if (sharePostContent) {
      setConversationMessage((prev) => {
        return [...prev, sharePostContent];
      });
      dispatch(getSharePost(null));
    }
  }, [sharePostContent]);

  const handleSentClick = async () => {
    if (inputMessage.trim().length === 0) {
      return;
    }

    if (existingChatIndex !== -1) {
      const updatedChatList = [...conversations];
      const updatedChat = { ...updatedChatList[existingChatIndex] };
      updatedChatList.splice(existingChatIndex, 1); // Remove the existing chat
      updatedChatList.unshift(updatedChat); // Add the updated chat to the top

      dispatch(getList(updatedChatList));
    }

    const newMessage = {
      conversationId: conversationId,
      sender: user.id,
      text: inputMessage,
    };
    socket.emit("sendMessage", {
      senderId: user.id,
      receiverId: conversationUser.externalId,
      text: inputMessage,
      conversationId,
    });

    try {
      const res = await axios.post(
        "https://social-app-backend-idrz.onrender.com/message",
        newMessage
      );
      setConversationMessage((prev) => {
        return [...prev, res.data];
      });
      setInputMessage("");
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const getConversationMessage = async () => {
      try {
        const res = await axios.get(
          `https://social-app-backend-idrz.onrender.com/message/${conversationId}`
        );
        setConversationMessage(res.data);
        setIsLoading(false);
      } catch (err) {
        console.log(err);
      }
    };
    getConversationMessage();
  }, [conversationId]);

  useEffect(() => {
    const scrollTimeout = setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      }
    }, 520); // Adjust the delay as needed

    return () => {
      // Clear the timeout when the component unmounts
      clearTimeout(scrollTimeout);
    };
  }, [conversationMessage]);

  const calculateTimeAgo = (timeAgo) => {
    const parsedTimestamp = new Date(timeAgo);
    const currentTime = new Date();
    const timeDifference = currentTime - parsedTimestamp;
    const seconds = Math.floor(timeDifference / 1000);

    let timestamp = "";
    if (seconds < 60) {
      timestamp = "just now";
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      timestamp = `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
    } else if (seconds < 86400) {
      const hours = Math.floor(seconds / 3600);
      timestamp = `${hours} hour${hours === 1 ? "" : "s"} ago`;
    } else if (seconds < 604800) {
      const days = Math.floor(seconds / 86400);
      timestamp = `${days} day${days === 1 ? "" : "s"} ago`;
    } else if (seconds < 2419200) {
      const weeks = Math.floor(seconds / 604800);
      timestamp = `${weeks} week${weeks === 1 ? "" : "s"} ago`;
    } else if (seconds < 29030400) {
      const months = Math.floor(seconds / 2419200);
      timestamp = `${months} month${months === 1 ? "" : "s"} ago`;
    } else {
      const years = Math.floor(seconds / 29030400);
      timestamp = `${years} year${years === 1 ? "" : "s"} ago`;
    }
    return timestamp;
  };

  const handleMessageDelete = (id) => {
    setConversationMessage((prev) => prev.filter((msg) => msg?._id !== id));
  };

  return (
    <div className={styles.container}>
      <div className={styles.topContainer}>
        <div className={styles.topLeftContainer}>
          <div onClick={handleClick}>
            <KeyboardBackspace />
          </div>
          <div className={styles.topMiddleContainer}>
            <Link
              to={`/profile/${conversationUser?.externalId}`}
              className={styles.link}
            >
              <div className={styles.imgContainer}>
                <img
                  className={styles.img}
                  src={conversationUser?.profile_img}
                  alt=""
                />
              </div>
            </Link>
            <p>{conversationUser?.fullname}</p>
          </div>
        </div>
        <div className={styles.video}>
          <Videocam />
        </div>
      </div>
      <div className={styles.messageContainer} ref={messageContainerRef}>
        {!isLoading &&
          conversationMessage.map((msg, idx) => {
            const timestamp = calculateTimeAgo(msg.createdAt);

            return (
              <div ref={scrollRef} key={idx}>
                <SingleMessage
                  msg={msg}
                  key={idx}
                  timestamp={timestamp}
                  deleteHandler={handleMessageDelete}
                />
              </div>
            );
          })}
        {isLoading && (
          <div
            style={{ width: "100%", display: "flex", justifyContent: "center" }}
          >
            <Spinner />
          </div>
        )}
      </div>
      <div className={styles.bottomContainer}>
        <input
          placeholder="Enter Message"
          value={inputMessage}
          onChange={(e) => {
            setInputMessage(e.target.value);
          }}
          className={styles.input}
        />
        <div className={styles.sentContainer} onClick={handleSentClick}>
          <Send />
        </div>
      </div>
    </div>
  );
};

export default Conversation;
