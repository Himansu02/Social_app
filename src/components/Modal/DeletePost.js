import React from "react";
import styles from "./DeletePost.module.css";
import axios from "axios";
import { useDispatch } from "react-redux";
import { deletePost } from "../redux/postReducer";

const DeletePost = ({ postId, closeModal }) => {
  const dispatch = useDispatch();

  const handleDelete = async () => {
    try {
      await axios.delete(
        `https://social-app-backend-idrz.onrender.com/post/${postId}`
      );
      dispatch(deletePost({ postId }));
      closeModal();
    } catch (err) {
      console.log(err);
    }
  };

  const handleCancel = () => {
    closeModal();
  };

  return (
    <div className={styles.container}>
      <p>Are you sure you want to delete this post ?</p>
      <div className={styles.buttonContainer}>
        <button className={styles.button} onClick={handleDelete}>
          Delete
        </button>
        <button className={styles.button} onClick={handleCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default DeletePost;
