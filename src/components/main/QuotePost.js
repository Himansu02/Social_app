import React, { useEffect, useState } from "react";
import styles from "./QuotePost.module.css";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import RepeatIcon from "@mui/icons-material/Repeat";
import ShareIcon from "@mui/icons-material/Share";
import {
  Close,
  Delete,
  Edit,
  Favorite,
  FavoriteBorder,
  FavoriteOutlined,
  MoreVert,
  Share,
  Visibility,
} from "@mui/icons-material";
import PostImage from "./PostImage";
import { Link } from "react-router-dom";
import CarouselComponent from "./CarouselComponent";
import { useUser } from "@clerk/clerk-react";
import axios from "axios";
import { Modal } from "@mui/material";
import ShareToConversation from "./ShareToConversation";
import EditPost from "../Modal/EditPost";
import { useSelector } from "react-redux";
import DeletePost from "../Modal/DeletePost";
import CommentModal from "../Modal/CommentModal";

function QuotePost({ post }) {
  const [postComments, setPostComments] = useState([]);
  const [openDot, setOpenDot] = useState(false);
  const [liked, setLiked] = useState(false);
  const [postLikes, setPostLikes] = useState([]);
  const [openModal, setOpenModal] = useState({
    share: false,
    edit: false,
    delete: false,
    chat: false,
  });
  const [open, setOpen] = useState(false);

  const socket = useSelector((state) => state.socket.socket);

  useEffect(() => {
    const getPostComment = async () => {
      const res = await axios.get(
        `https://social-app-backend-idrz.onrender.com/comment/${post._id}`
      );
      setPostComments(res.data);
    };
    getPostComment();
  }, []);

  const { user } = useUser();

  useEffect(() => {
    setLiked(post?.like.includes(user.id));
    setPostLikes([...post?.like]);
  }, [post]);

  const handleDotClick = (e) => {
    setOpenDot(!openDot);
  };

  const handleLike = async () => {
    const notification = {
      externalId: post?.postedBy.externalId,
      senderId: user.id,
      postId: post?._id,
      type: 1,
    };
    setLiked(!liked);
    if (!liked) {
      socket?.emit("sendNotification", {
        senderId: user.id,
        receiverId: post?.postedBy.externalId,
        type: 1,
        postId: post?._id,
      });

      setPostLikes((prev) => {
        return [...prev, user.id];
      });

      try {
        const res = await axios.put(
          `https://social-app-backend-idrz.onrender.com/post/${post?._id}/like`,
          { userId: user.id, receverId: post?.postedBy.externalId }
        );
      } catch (err) {
        console.log(err);
      }
    }
    if (liked) {
      setPostLikes((prev) => {
        return prev.filter((id) => {
          return id !== user.id;
        });
      });

      try {
        const res = await axios.put(
          `https://social-app-backend-idrz.onrender.com/post/${post?._id}/unlike`,
          { userId: user.id, receverId: post?.postedBy.externalId }
        );
      } catch (err) {}
    }
  };

  let timestamp = "";

  const calculateTimeAgo = () => {
    const parsedTimestamp = new Date(post?.createdAt);
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

  const handleClose = () => {
    setOpen(false);
    setOpenModal({
      share: false,
      edit: false,
      delete: false,
      chat: false,
    });
  };

  const handleChatClick = () => {
    setOpen(true);
    setOpenModal((prev) => {
      return { ...prev, chat: true };
    });
  };

  return (
    <div className={styles.quotePost}>
      <div className={styles.postHeader}>
        <Link
          to={`/profile/${post?.postedBy.externalId}`}
          className={styles.link}
        >
          <div className={styles.imageContainer}>
            <img
              className={styles.profilePicture}
              src={post?.postedBy.profile_img}
              alt="User Profile"
            />
          </div>
        </Link>
        <div className={styles.userInfo}>
          <div className={styles.userInfoLeft}>
            <p className={styles.displayName}>{post?.postedBy.fullname}</p>
            <p className={styles.username}>@{post?.postedBy.username}</p>
          </div>
          <div className={styles.dot} onClick={handleDotClick}>
            <MoreVert />
          </div>
        </div>
      </div>
      <p className={styles.quoteText}>{post?.desc}</p>

      {post?.image.length > 0 && (
        <div className={styles.postedImageContainer}>
          <CarouselComponent
            height={window.innerWidth <= 768 ? 550 : 680}
            size={window.innerWidth <= 768 ? window.innerWidth - 100 : 728}
            images={post?.image}
          />
        </div>
      )}

      <div className={styles.postFooter}>
        <p className={styles.timestamp}>{timestamp}</p>
        <div className={styles.actions}>
          <Link to={`/post/${post?._id}`} className={styles.link}>
            <div className={styles.actionItem}>
              <Visibility fontSize="small" />
            </div>
          </Link>
          <div className={styles.actionItem} onClick={handleChatClick}>
            <ChatBubbleOutlineIcon fontSize="small" />
            <span>{postComments.length}</span>
          </div>
          <div
            className={`${styles.actionItem} ${liked && styles.liked}`}
            onClick={handleLike}
          >
            {!liked && <FavoriteBorder fontSize="small" />}
            {liked && <Favorite />}
            <span>{postLikes.length}</span>
          </div>
        </div>
      </div>
      {openDot && (
        <div
          className={styles.dotContainer}
          onClick={(e) => e.preventDefault()}
        >
          {user.id === post?.postedBy.externalId && (
            <div
              className={styles.dotIcons}
              onClick={() => {
                setOpenModal((prev) => {
                  return { ...prev, edit: true };
                });
                setOpen(true);
              }}
            >
              <Edit />
              <p>Edit</p>
            </div>
          )}
          <div
            className={styles.dotIcons}
            onClick={() => {
              setOpenModal((prev) => {
                return { ...prev, share: true };
              });
              setOpen(true);
            }}
          >
            <Share />
            <p>Share to...</p>
          </div>
          <Link
            to={`/post/${post?._id}`}
            className={styles.link}
            style={{ color: "black" }}
          >
            <div className={styles.dotIcons}>
              <Visibility />
              <p>View Post</p>
            </div>
          </Link>
          {user.id === post?.postedBy.externalId && (
            <div
              className={styles.dotIcons}
              onClick={() => {
                setOpenModal((prev) => {
                  return { ...prev, delete: true };
                });
                setOpen(true);
              }}
            >
              <Delete />
              <p>Delete</p>
            </div>
          )}
        </div>
      )}
      <Modal onClose={handleClose} open={open} className={styles.test}>
        <div style={{ outline: "none" }}>
          {openModal.edit && (
            <EditPost postId={post?._id} close={handleClose} />
          )}
          {openModal.share && <ShareToConversation postId={post?._id} />}
          {openModal.delete && (
            <DeletePost postId={post?._id} closeModal={handleClose} />
          )}
          {openModal.chat && (
            <CommentModal postId={post?._id} closeModal={handleClose} />
          )}
        </div>
      </Modal>
    </div>
  );
}

export default QuotePost;
