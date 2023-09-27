import React, { useRef, useState } from "react";
import styles from "./NewPost.module.css";
import { AddLocation, Close, EmojiEmotions, Image } from "@mui/icons-material";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import Masonry from "react-masonry-css";
import { useUser } from "@clerk/clerk-react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Modal } from "@mui/material";
import Loader from "../UI/Loader";
import { app } from "../../Firebase";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { addPost } from "../redux/postReducer";
import CarouselComponent from "../main/CarouselComponent";

const NewPost = ({ closeModal }) => {
  const navigate = useNavigate();

  const { user } = useUser();

  const reduxUser = useSelector((state) => state.user.user);

  const textRef = useRef(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [load, setLoad] = useState(false);

  const dispatch = useDispatch();

  const handleInput = (e) => {
    if (textRef.current) {
      textRef.current.style.height = "auto";
      textRef.current.style.height = `${e.target.scrollHeight}px`;
    }
  };
  const [selectedImages, setSelectedImages] = useState([]);

  const inputRef = useRef(null);

  const handleImageChange = (e) => {
    const files = e.target.files;
    const selectedImageArray = Array.from(files);
    setSelectedImages((prev) => {
      return [...prev, ...selectedImageArray];
    });
  };

  const handleRemoveImage = (index) => {
    console.log(index);
    const updatedImages = selectedImages.filter((_, i) => i !== index);
    console.log(updatedImages);
    setSelectedImages(updatedImages);
  };

  const handleClick = async () => {
    try {
      let postData = {
        postedBy: reduxUser._id,
        desc: textRef.current.value,
        image: [],
        like: [],
        comment: [],
        location: "",
      };
      setLoad(true);

      if (selectedImages.length > 0) {
        console.log("working");
        const totalImages = selectedImages.length;
        let overallProgress = 0;
        let uploadedFiles = 0;

        for (let i = 0; i < totalImages; i++) {
          const fileName = new Date().getTime() + selectedImages[i].name;
          console.log(fileName);

          const storage = getStorage(app);
          const storageRef = ref(storage, fileName);

          const uploadTask = uploadBytesResumable(
            storageRef,
            selectedImages[i]
          );

          // Register three observers:
          // 1. 'state_changed' observer, called any time the state changes
          // 2. Error observer, called on failure
          // 3. Completion observer, called on successful completion
          uploadTask.on(
            "state_changed",
            (snapshot) => {
              // Observe state change events such as progress, pause, and resume
              // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
              const progress =
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

              console.log("Upload is " + progress + "% done");

              overallProgress =
                (uploadedFiles / totalImages) * 100 + progress / totalImages;
              setUploadProgress(overallProgress);

              switch (snapshot.state) {
                case "paused":
                  console.log("Upload is paused");
                  break;
                case "running":
                  console.log("Upload is running");
                  break;
                default:
              }
            },
            (error) => {
              // Handle unsuccessful uploads
            },
            () => {
              // Handle successful uploads on complete
              // For instance, get the download URL: https://firebasestorage.googleapis.com/...
              getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                console.log(downloadURL);
                postData.image.push(downloadURL);
                uploadedFiles++;
                if (uploadedFiles === totalImages) {
                  // All files have been uploaded
                  setUploadProgress(100); // Set progress to 100%
                  // Continue with your axios.post and other logic
                  const sentPostData = async () => {
                    try {
                      const res = await axios.post(
                        "https://social-app-backend-idrz.onrender.com/post",
                        postData
                      );
                      dispatch(addPost(res.data));
                      const data = await axios.put(
                        `https://social-app-backend-idrz.onrender.com/user/update/${user.id}/media`,
                        postData.image
                      );
                      console.log(data.data);
                    } catch (err) {
                      console.log(err);
                    }
                  };
                  sentPostData();
                  setLoad(false);
                  closeModal();
                }
              });
            }
          );
        }
      } else {
        const res = await axios.post(
          "https://social-app-backend-idrz.onrender.com/post",
          postData
        );
        dispatch(addPost(res.data));
        closeModal();
      }
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <div className={styles.modalContainer}>
      <div className={styles.userInfoContainer}>
        <div className={styles.imgContainer}>
          <img className={styles.img} src={user.imageUrl} alt="" />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div className={styles.userInfo}>
            <p className={styles.displayName}>{user.fullName}</p>
            <p className={styles.username}>@{user.username}</p>
          </div>
          <Close onClick={() => closeModal()} />
        </div>
      </div>
      <div className={styles.inputArea}>
        <textarea
          ref={textRef}
          rows={1}
          placeholder="Enter text here..."
          onInput={handleInput}
        />
      </div>
      <div className={styles.selectedImagesContainer}>
        {selectedImages.length > 0 && (
          <CarouselComponent
            images={selectedImages}
            pel={true}
            deleteHandler={handleRemoveImage}
          />
        )}
      </div>
      <div className={styles.postButton}>
        <div className={styles.mediaContainer}>
          <div className={styles.icons}>
            <Image onClick={() => inputRef.current.click()} />
            <input
              type="file"
              multiple
              onChange={handleImageChange}
              className={styles.imageInput}
              ref={inputRef}
            />
          </div>
          <div className={styles.icons}>
            <EmojiEmotions />
          </div>
          <div className={styles.icons}>
            <AddLocation />
          </div>
        </div>
        <div>
          <button className={styles.button} onClick={handleClick}>
            Post
          </button>
        </div>
      </div>
      <Modal open={load} className={styles.test}>
        <Loader progress={uploadProgress} />
      </Modal>
    </div>
  );
};

export default NewPost;
