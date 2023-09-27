import React, { useEffect, useState } from "react";
import styles from "./Notification.module.css";
import { Link, useParams } from "react-router-dom";
import { KeyboardBackspace } from "@mui/icons-material";
import { useSelector } from "react-redux";
import axios from "axios";
import NotificationContent from "../components/main/NotificationContent";
import InfiniteScroll from "react-infinite-scroll-component";
import LoadingSpinner from "../components/UI/LoadingSpinner";
import Spinner from "../components/UI/Spinner";

const Notification = () => {
  const [notificationArray, setNotificationArray] = useState([]);
  const [hasMore, setHasMore] = useState(true); // Track if there are more posts to load
  const [page, setPage] = useState(1); // Track the current page
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);

  const socket = useSelector((state) => state.socket.socket);
  const postsPerPage = 15;

  const [selectedSection, setSelectedSection] = useState("all");

  useEffect(() => {
    const getNotification = async () => {
      try {
        const res = await axios.get(
          `https://social-app-backend-idrz.onrender.com/notification/${id}?page=${page}&limit=${postsPerPage}`
        );
        console.log(res.data);
        if (res.data.length === 0) {
          setHasMore(false); // No more posts to load
        } else {
          setNotificationArray((prev) => [...prev, ...res.data]);
        }
        setIsLoading(false);
      } catch (err) {
        console.log(err);
      }
    };
    getNotification();
  }, [page]);

  const loadMore = () => {
    console.log("called");
    setPage(page + 1);
  };

  useEffect(() => {
    socket.on("getNotification", (data) => {
      setNotificationArray((prev) => {
        return [
          {
            senderId: data.senderId,
            postId: data.postId,
            type: data.type,
            text: data.text,
            commentId: data.commentId,
          },
          ...prev,
        ];
      });
    });
  }, []);

  const handleNotificationDelete = async (id) => {
    setNotificationArray((prev) => prev.filter((noti) => noti._id !== id));
  };

  return (
    <div className={styles.notificationContainer}>
      <div className={styles.title}>
        <Link to="/" className={styles.link}>
          <KeyboardBackspace />
        </Link>
        <h1 className={styles.sectionName}>Notifications</h1>
      </div>
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${
            selectedSection === "all" ? styles.activeTab : ""
          }`}
          onClick={() => setSelectedSection("all")}
        >
          ALL
        </button>
        <button
          className={`${styles.tab} ${
            selectedSection === "mention" ? styles.activeTab : ""
          }`}
          onClick={() => setSelectedSection("mention")}
        >
          MENTIONED
        </button>
      </div>
      <div className={styles.notifications}>
        <InfiniteScroll
          dataLength={notificationArray.length}
          next={loadMore}
          hasMore={hasMore}
          loader={() => setIsLoading(true)}
        >
          {notificationArray.map((notification, idx) => {
            return (
              <NotificationContent
                key={idx}
                notification={notification}
                deleteHandler={handleNotificationDelete}
              />
            );
          })}
        </InfiniteScroll>
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
      </div>
      {notificationArray.length === 0 && !isLoading && (
        <div className={styles.noNotificationContainer}>
          <p>No Notification.</p>
        </div>
      )}
    </div>
  );
};

export default Notification;
