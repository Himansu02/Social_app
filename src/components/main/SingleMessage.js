import React, { useEffect, useState } from "react";
import styles from "./SingleMessage.module.css";
import axios from "axios";
import { useUser } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { Delete } from "@mui/icons-material";
import { useSpring, animated } from "react-spring";

const SingleMessage = ({ msg, timestamp, deleteHandler }) => {
  const [post, setPost] = useState(null);
  const { user } = useUser();
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (msg?.postId) {
      const getPostData = async () => {
        const res = await axios.get(
          `https://social-app-backend-idrz.onrender.com/post/${msg?.postId}`
        );
        console.log(res.data);
        setPost(res.data);
      };
      getPostData();
    }
  }, [msg?.postId]);

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
        `https://social-app-backend-idrz.onrender.com/message/${msg?._id}`
      );

      deleteHandler(msg?._id);
    } catch (err) {
      console.log(err);
    }
  };

  const fadeAnimation = useSpring({
    opacity: 1,
    from: { opacity: 0 },
    config: { duration: 400 }, // Adjust the duration as needed
  });

  return (
    <animated.div
      style={fadeAnimation}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`${styles.cover} ${
        msg.sender === user.id ? styles.own : styles.away
      }`}
    >
      {msg?.text && (
        <div className={styles.content}>
          {msg.sender === user.id && isHovered && (
            <div
              style={{ marginRight: "20px", cursor: "pointer" }}
              onClick={handleMessageDelete}
            >
              <Delete />
            </div>
          )}
          <p
            className={`${styles.mainMessage} ${
              msg.sender === user.id ? styles.receiver : styles.sender
            }`}
          >
            {msg.text}
          </p>
          {msg.sender !== user.id && isHovered && (
            <div
              style={{ marginLeft: "20px", cursor: "pointer" }}
              onClick={handleMessageDelete}
            >
              <Delete />
            </div>
          )}
        </div>
      )}
      {msg?.postId && (
        <div className={styles.content}>
          {msg.sender === user.id && isHovered && (
            <div
              style={{ marginRight: "20px", cursor: "pointer" }}
              onClick={handleMessageDelete}
            >
              <Delete />
            </div>
          )}
          <Link to={`/post/${msg?.postId}`} className={styles.link}>
            <div
              className={`${styles.quotePost} ${
                msg.sender === user.id ? styles.receiver : styles.sender
              }`}
            >
              {post && (
                <>
                  <div className={styles.postHeader}>
                    <div className={styles.imageContainer}>
                      <img
                        className={styles.profilePicture}
                        src={post?.postedBy.profile_img}
                        alt="User Profile"
                      />
                    </div>

                    <div className={styles.userInfo}>
                      <div className={styles.userInfoLeft}>
                        <p className={styles.displayName}>
                          {post?.postedBy.fullname}
                        </p>
                        <p className={styles.username}>
                          @{post?.postedBy.username}
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className={styles.quoteText}>{post?.desc}</p>

                  {post?.image.length > 0 && (
                    <div className={styles.postImageContainer}>
                      <img src={post?.image[0]} alt="img" />
                    </div>
                  )}
                </>
              )}
              {!post && (
                <p style={{ fontWeight: "bold" }}>Post not available</p>
              )}
            </div>
          </Link>
          {msg.sender !== user.id && isHovered && (
            <div
              style={{ marginLeft: "20px", cursor: "pointer" }}
              onClick={handleMessageDelete}
            >
              <Delete />
            </div>
          )}
        </div>
      )}
      <p className={styles.time}>{timestamp}</p>
    </animated.div>
  );
};

export default SingleMessage;
