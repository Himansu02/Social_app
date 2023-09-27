import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import styles from "./EditPost.module.css";
import CarouselComponent from "../main/CarouselComponent";
import { useDispatch } from "react-redux";
import { updatePost } from "../redux/postReducer";
import Spinner from "../UI/Spinner";

const EditPost = ({ postId, close }) => {
  const [post, setPost] = useState(null);
  const [inputText, setInputText] = useState("");
  const textRef = useRef();
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (postId) {
      const getPostData = async () => {
        const res = await axios.get(
          `https://social-app-backend-idrz.onrender.com/post/${postId}`
        );
        setPost(res.data);
        setInputText(res.data.desc);
        setIsLoading(false);
      };
      getPostData();
    }
  }, [postId]);

  const handleInput = (e) => {
    if (textRef.current) {
      textRef.current.style.height = "auto";
      textRef.current.style.height = `${e.target.scrollHeight}px`;
    }
  };

  console.log(inputText);

  const handlePostUpdate = async (images) => {
    try {
      const updateData = {
        desc: inputText,
        image: images,
      };
      const res = await axios.put(
        `https://social-app-backend-idrz.onrender.com/post/${postId}`,
        updateData
      );
      dispatch(updatePost({ postId: postId, post: res.data }));
      close();
    } catch (err) {
      console.log(err);
    }
  };

  const handleClose = () => {
    close();
  };

  return (
    <div className={styles.quotePost}>
      {!isLoading && (
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
                <p className={styles.displayName}>{post?.postedBy.fullname}</p>
                <p className={styles.username}>@{post?.postedBy.username}</p>
              </div>
            </div>
          </div>
          <div className={styles.inputArea}>
            <textarea
              ref={textRef}
              rows={1}
              placeholder="Enter text here..."
              value={inputText}
              onInput={handleInput}
              onChange={(e) => {
                setInputText(e.target.value);
              }}
            />
          </div>

          {post?.image.length > 0 && (
            <div className={styles.postedImageContainer}>
              <CarouselComponent
                size={window.innerWidth <= 768 ? 410 : 630}
                height={window.innerWidth <= 768 ? 400 : 500}
                del={true}
                images={post?.image}
                updatePostData={handlePostUpdate}
                closeModal={handleClose}
              />
            </div>
          )}
        </>
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
      <div className={styles.buttonContainer}>
        <button className={styles.button} onClick={handleClose}>
          Cancel
        </button>
        <button className={styles.button} onClick={handlePostUpdate}>
          Done
        </button>
      </div>
    </div>
  );
};

export default EditPost;
