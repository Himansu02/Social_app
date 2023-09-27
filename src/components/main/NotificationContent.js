import React, { useEffect, useState } from "react";
import styles from "./NotificationContent.module.css";
import axios from "axios";
import { Link } from "react-router-dom";
import { Delete } from "@mui/icons-material";
import Spinner from "../UI/Spinner";

const keyValueMap = new Map();
keyValueMap.set(1, "liked your post.");
keyValueMap.set(2, "commented on your post ");
keyValueMap.set(3, "liked your comment in a post");

const NotificationContent = ({ notification, deleteHandler }) => {
  const [sender, setSender] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getSender = async () => {
      const res = await axios.get(
        `https://social-app-backend-idrz.onrender.com/user/${notification.senderId}`
      );
      setSender(res.data);
      setIsLoading(false);
    };
    getSender();
  }, [notification.senderId]);

  let timestamp = "";

  const calculateTimeAgo = () => {
    const parsedTimestamp = new Date(notification?.createdAt);
    const currentTime = new Date();
    const timeDifference = currentTime - parsedTimestamp;
    const seconds = Math.floor(timeDifference / 1000);

    if (seconds < 60) {
      timestamp = "now";
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      timestamp = `${minutes} min${minutes === 1 ? "" : "s"} `;
    } else if (seconds < 86400) {
      const hours = Math.floor(seconds / 3600);
      timestamp = `${hours} hour${hours === 1 ? "" : "s"} `;
    } else if (seconds < 604800) {
      const days = Math.floor(seconds / 86400);
      timestamp = `${days} day${days === 1 ? "" : "s"} `;
    } else if (seconds < 2419200) {
      const weeks = Math.floor(seconds / 604800);
      timestamp = `${weeks} week${weeks === 1 ? "" : "s"} `;
    } else if (seconds < 29030400) {
      const months = Math.floor(seconds / 2419200);
      timestamp = `${months} month${months === 1 ? "" : "s"} `;
    } else {
      const years = Math.floor(seconds / 29030400);
      timestamp = `${years} year${years === 1 ? "" : "s"} `;
    }
  };

  calculateTimeAgo();

  // Function to handle mouse enter event
  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  // Function to handle mouse leave event
  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleMessageDelete = async () => {
    try {
      const res = await axios.delete(
        `https://social-app-backend-idrz.onrender.com/notification/one/${notification?._id}`
      );

      deleteHandler(notification?._id);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      {!isLoading && (
        <div
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={styles.container}
        >
          {isHovered && (
            <div
              style={{ marginRight: "5px", cursor: "pointer" }}
              onClick={handleMessageDelete}
            >
              <Delete />
            </div>
          )}
          <div style={{ width: "100%" }}>
            <Link
              to={`/post/${notification.postId}/${
                (notification.type === 2 || notification.type === 3) &&
                notification.commentId
              }`}
              className={styles.link}
            >
              <div className={styles.notification}>
                <div className={styles.leftContainer}>
                  <div className={styles.imgContainer}>
                    <img
                      className={styles.img}
                      src={sender?.profile_img}
                      alt=""
                    />
                  </div>

                  <div className={styles.message}>
                    {notification.type === 1 && (
                      <p style={{ wordBreak: "break-word" }}>
                        {sender?.username +
                          " " +
                          keyValueMap.get(notification.type)}
                      </p>
                    )}
                    {notification.type === 2 && (
                      <div
                        style={{ wordBreak: "break-word" }}
                        dangerouslySetInnerHTML={{
                          __html:
                            sender?.username +
                            " " +
                            keyValueMap.get(notification.type) +
                            " : " +
                            notification?.text,
                        }}
                      />
                    )}
                    {notification.type === 3 && (
                      <p style={{ wordBreak: "break-word" }}>
                        {sender?.username +
                          " " +
                          keyValueMap.get(notification.type)}
                      </p>
                    )}
                  </div>
                </div>
                <div className={styles.timestamp}>{timestamp}</div>
              </div>
            </Link>
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

export default NotificationContent;
