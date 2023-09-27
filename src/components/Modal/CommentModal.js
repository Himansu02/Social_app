import { useUser } from "@clerk/clerk-react";
import React, { useEffect, useRef, useState } from "react";
import styles from "./CommentModal.module.css";
import axios from "axios";
import { Close, KeyboardBackspace, Send } from "@mui/icons-material";
import CommentSection from "../main/CommentSection";
import { useSelector } from "react-redux";
import Comment from "../main/Comment";
import Spinner from "../UI/Spinner";

const CommentModal = ({ postId, closeModal }) => {
  const { user } = useUser();
  const [postComments, setPostComments] = useState([]);
  const socket = useSelector((state) => state.socket.socket);
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const ref = useRef(null);

  const handleInput = (e) => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = `${e.target.scrollHeight}px`;
    }
  };

  useEffect(() => {
    const getPostComment = async () => {
      try {
        const res = await axios.get(
          `https://social-app-backend-idrz.onrender.com/comment/${postId}`
        );
        setPostComments(res.data);
        setIsLoading(false);
      } catch (err) {
        console.log(err);
      }
    };
    getPostComment();
  }, [postId]);

  useEffect(() => {
    if (postId) {
      const getPostData = async () => {
        const res = await axios.get(
          `https://social-app-backend-idrz.onrender.com/post/${postId}`
        );
        setPost(res.data);
      };
      getPostData();
    }
  }, [postId]);

  const handleCommentSubmit = async () => {
    if (ref.current.value.trim().length > 0) {
      const newComment = {
        postId,
        senderId: user.id,
        receiverId: post?.postedBy.externalId,
        text: ref.current.value,
        likes: [],
      };

      try {
        const res = await axios.post(
          "https://social-app-backend-idrz.onrender.com/comment",
          newComment
        );

        setPostComments((prev) => {
          return [res.data, ...prev];
        });

        const notification = {
          postId,
          senderId: user.id,
          externalId: post?.postedBy.externalId,
          text: res.data.text,
          commentId: res.data._id,
          type: 2,
        };

        socket?.emit("sendNotification", {
          senderId: user.id,
          receiverId: post?.postedBy.externalId,
          type: 2,
          postId: postId,
          commentId: res.data._id,
          text: res.data.text,
        });

        try {
          const res = await axios.post(
            `https://social-app-backend-idrz.onrender.com/notification/`,
            notification
          );
        } catch (err) {
          console.log(err);
        }

        ref.current.value = "";
      } catch (err) {
        console.log(err);
      }
    }
  };

  const handleDelete = (id) => {
    setPostComments((prev) => {
      return prev.filter((com) => {
        return com._id !== id;
      });
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.topContainer}>
        <div
          onClick={() => {
            closeModal();
          }}
          style={{ cursor: "pointer" }}
        >
          <KeyboardBackspace />
        </div>
        <h1>Post Comments</h1>
      </div>
      <div className={styles.input}>
        <div className={styles.commentImgContainer}>
          <img className={styles.commentImg} src={user.imageUrl} alt="" />
        </div>
        <div className={styles.inputArea}>
          <textarea
            ref={ref}
            rows={1}
            placeholder="Add Comment..."
            onInput={handleInput}
          />
        </div>
        <div onClick={handleCommentSubmit}>
          <Send />
        </div>
      </div>
      <div className={styles.commentSection}>
        {postComments?.map((comment, index) => {
          return (
            <Comment
              key={index}
              comment={comment}
              postId={postId}
              postUser={post?.postedBy.externalId}
              deleteHandler={handleDelete}
            />
          );
        })}
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
        {!isLoading && postComments?.length === 0 && (
          <div className={styles.noCommentContainer}>
            <p>No Comments.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentModal;
