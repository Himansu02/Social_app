import axios from "axios";
import React, { useEffect, useState } from "react";
import styles from "./Comment.module.css";
import { Favorite, FavoriteBorder } from "@mui/icons-material";
import { useSelector } from "react-redux";
import { useUser } from "@clerk/clerk-react";

const Comment = ({ comment, postId }) => {
  const [user, setUser] = useState(null);
  const [liked, setLiked] = useState(false);
  const [commentLikes, setCommentLikes] = useState(comment.likes.length);

  const { user: currentUser } = useUser();

  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/user/${comment.senderId}`
        );
        setUser(res.data);
        setLiked(comment.likes.includes(currentUser.id));
      } catch (err) {
        console.log(err);
      }
    };
    getUser();
  }, [comment.senderId]);

  const socket = useSelector((state) => state.socket.socket);

  const handleLike = async () => {
    if (!liked) {
      socket?.emit("sendNotification", {
        senderId: currentUser.id,
        receiverId: user?.externalId,
        type: 3,
        postId: postId,
        commentId: comment?._id,
      });

      setCommentLikes((prev) => prev + 1);
      setLiked(!liked);
      try {
        const res = await axios.put(
          `http://localhost:5000/comment/${comment?._id}/like`,
          {
            userId: currentUser.id,
            postId: postId,
            receverId: user?.externalId,
          }
        );
      } catch (err) {
        console.log(err);
      }
    }
    if (liked) {
      setCommentLikes((prev) => prev - 1);
      setLiked(!liked);
      try {
        const res = await axios.put(
          `http://localhost:5000/comment/${comment?._id}/unlike`,
          {
            userId: currentUser.id,
            postId: postId,
            receverId: user?.externalId,
          }
        );
      } catch (err) {
        console.log(err);
      }
    }
  };

  let timestamp = "";

  const calculateTimeAgo = () => {
    const parsedTimestamp = new Date(comment?.createdAt);
    const currentTime = new Date();
    const timeDifference = currentTime - parsedTimestamp;
    const seconds = Math.floor(timeDifference / 1000);

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
  };

  calculateTimeAgo();

  return (
    <div className={styles.post} id={comment?._id}>
      <div>
        <div className={styles.postHeader}>
          <img
            className={styles.profilePicture}
            src={user?.profile_img}
            alt="User Profile"
          />
          <div className={styles.nameContainer}>
            <div className={styles.userInfo}>
              <p className={styles.displayName}>{user?.fullname}</p>
              <p className={styles.username}>@{user?.username}</p>
            </div>
            <div className={styles.timestamp}>{timestamp}</div>
          </div>
        </div>
        <div className={styles.messageContainer}>
          <div
            className={styles.postContent}
            dangerouslySetInnerHTML={{ __html: comment?.text }}
          />
        </div>
      </div>
      <div
        className={`${styles.likeBox} ${liked && styles.liked}`}
        onClick={handleLike}
      >
        {!liked && <FavoriteBorder />}
        {liked && <Favorite />}
        {commentLikes > 0 && <span>{commentLikes}</span>}
      </div>
    </div>
  );
};

export default Comment;
