import React, { useEffect, useRef, useState } from "react";
import styles from "./EditProfile.module.css";
import { AddAPhoto, Close } from "@mui/icons-material";
import { app } from "../../Firebase";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import axios from "axios";
import { Modal } from "@mui/material";
import Loader from "../UI/Loader";
import { useDispatch } from "react-redux";
import { updateCurrentUser } from "../redux/userReducer";

const EditProfile = ({ user, handleClose }) => {
  // console.log(user)
  const [uploadProgress, setUploadProgress] = useState(0);
  const [load, setLoad] = useState(false);
  const inputRef = useRef();
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [coverImageUrl, setCoverImageUrl] = useState(user?.cover_img);
  const [addImage, setAddImage] = useState(false);
  const [isEdit, setIsEdit] = useState({
    bio: user?.bio ? false : true,
    location: user?.location ? false : true,
    dob: user?.dob ? false : true,
  });

  const dispatch = useDispatch();

  const [inputValues, setInputValues] = useState({
    bio: "",
    location: "",
    dob: "",
  });

  const formatDate = (inputDate) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    const date = new Date(inputDate);
    return date.toLocaleDateString(undefined, options);
  };

  const handleImageChange = (e) => {
    console.log(inputRef.current.files[0]);
    setCoverImageFile(inputRef.current.files[0]);
  };

  const handleMouseEnter = () => {
    setAddImage(true);
  };

  const handleMouseLeave = () => {
    setAddImage(false);
  };

  const handleCancel = (field) => {
    setIsEdit((prev) => {
      return { ...prev, [field]: false };
    });
  };

  const handleEdit = (field) => {
    setIsEdit((prev) => {
      return { ...prev, [field]: true };
    });
  };

  const handleInputChange = (e) => {
    if (e.target.name === "dob") {
      const date = formatDate(e.target.value);
      setInputValues((prev) => {
        return { ...prev, dob: date };
      });
      return;
    }
    setInputValues((prev) => {
      return { ...prev, [e.target.name]: e.target.value };
    });
  };

  const updateHandler = () => {
    let updaterUserArray = [];
    if (isEdit.bio) {
      updaterUserArray.push({ bio: inputValues.bio });
    }
    if (isEdit.location) {
      updaterUserArray.push({ location: inputValues.location });
    }
    if (isEdit.dob) {
      updaterUserArray.push({ dob: inputValues.dob });
    }

    let updatedUser = {};
    for (let i = 0; i < updaterUserArray.length; i++) {
      updatedUser = { ...updatedUser, ...updaterUserArray[i] };
    }

    if (coverImageFile) {
      setLoad(true);
      const fileName = new Date().getTime() + coverImageFile.name;
      console.log(fileName);

      const storage = getStorage(app);
      const storageRef = ref(storage, fileName);

      const uploadTask = uploadBytesResumable(storageRef, coverImageFile);

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
          setUploadProgress(progress);
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
            const updateUser = async () => {
              try {
                const res = await axios.put(
                  `https://social-app-backend-idrz.onrender.com/user/update/${user?.externalId}`,
                  { ...updatedUser, cover_img: downloadURL }
                );
                dispatch(updateCurrentUser(res.data));
                setLoad(false);
                setIsEdit({
                  bio: user?.bio ? false : true,
                  location: user?.location ? false : true,
                  dob: user?.dob ? false : true,
                });
              } catch (err) {
                console.log(err);
              }
            };
            updateUser();
            setCoverImageUrl(downloadURL);
            // updateUser(id, newUser, dispatch);
            // console.log(product);
          });
        }
      );
    } else {
      const updateUser = async () => {
        try {
          console.log("working");
          const res = await axios.put(
            `https://social-app-backend-idrz.onrender.com/user/update/${user?.externalId}`,
            updatedUser
          );
          dispatch(updateCurrentUser(res.data));
          setIsEdit({
            bio: user?.bio ? false : true,
            location: user?.location ? false : true,
            dob: user?.dob ? false : true,
          });
        } catch (err) {
          console.log(err);
        }
      };
      updateUser();
    }
  };

  return (
    <div className={styles.container}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h1>Edit Profile</h1>
        <Close onClick={() => handleClose()} />
      </div>

      <div className={styles.imageInputContainer}>
        <div
          className={styles.imageContainer}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <img
            src={`${
              coverImageUrl.trim().length > 0
                ? coverImageUrl
                : "https://th.bing.com/th/id/OIP.bPBCgvp9N0SUbVYJnBg2IQHaEo?w=230&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7"
            }`}
            alt="cvr-img"
          />
          {addImage && (
            <div
              className={styles.cameraIconContainer}
              onClick={() => inputRef.current.click()}
            >
              <AddAPhoto fontSize="large" />
            </div>
          )}
        </div>
        <input
          type="file"
          onChange={handleImageChange}
          className={styles.imageInput}
          ref={inputRef}
        />
      </div>
      <div className={styles.inputContainer}>
        <form>
          <label htmlFor="bio">
            Bio &middot;{" "}
            {isEdit.bio ? (
              <span
                className={styles.edit}
                onClick={() => {
                  handleCancel("bio");
                }}
              >
                Cancel
              </span>
            ) : (
              <span
                className={styles.edit}
                onClick={() => {
                  handleEdit("bio");
                }}
              >
                Edit
              </span>
            )}
          </label>
          {!isEdit.bio && (
            <p className={styles.paragraph}>{`${
              user?.bio ? user?.bio : "Click on edit to add Bio.."
            }`}</p>
          )}
          {isEdit.bio && (
            <textarea
              name="bio"
              className={styles.inputField}
              placeholder="Add.."
              onChange={handleInputChange}
            />
          )}
          <label htmlFor="location">
            Location &middot;{" "}
            {isEdit.location ? (
              <span
                className={styles.edit}
                onClick={() => {
                  handleCancel("location");
                }}
              >
                Cancel
              </span>
            ) : (
              <span
                className={styles.edit}
                onClick={() => {
                  handleEdit("location");
                }}
              >
                Edit
              </span>
            )}
          </label>
          {!isEdit.location && (
            <p className={styles.paragraph}>{`${
              user?.location
                ? user?.location
                : "Click on edit to add Location.."
            }`}</p>
          )}
          {isEdit.location && (
            <input
              name="location"
              onChange={handleInputChange}
              placeholder="Add.."
            />
          )}
          <div className={styles.dobContainer}>
            <label className={styles.label}>
              Date of Birth &middot;{" "}
              {isEdit.dob ? (
                <span
                  className={styles.edit}
                  onClick={() => {
                    handleCancel("dob");
                  }}
                >
                  Cancel
                </span>
              ) : (
                <span
                  className={styles.edit}
                  onClick={() => {
                    handleEdit("dob");
                  }}
                >
                  Edit
                </span>
              )}
            </label>
            {!isEdit.dob && (
              <p className={styles.paragraph}>{`${
                user?.dob ? user?.dob : "Click on edit to add Date of Birth.."
              }`}</p>
            )}
            {isEdit.dob && (
              <input
                name="dob"
                type="date"
                className={styles.inputField}
                placeholder="YYYY-MM-DD"
                pattern="\d{4}-\d{2}-\d{2}"
                onChange={handleInputChange}
              />
            )}
          </div>
        </form>
      </div>
      {(isEdit.bio || isEdit.dob || isEdit.location || coverImageFile) && (
        <div className={styles.buttonContainer}>
          <button className={styles.button} onClick={updateHandler}>
            Update
          </button>
        </div>
      )}
      <Modal
        open={load}
        style={{
          position: "absolute",
          boxShadow: "2px solid black",
          height: window.innerWidth <= 768 ? 500 : 700,
          width: window.innerWidth <= 768 ? 430 : 650,
          left: `${window.innerWidth <= 768 ? "20%" : "30%"}`,
          top: "5%",
          overflow: "auto",
        }}
      >
        <Loader progress={uploadProgress} />
      </Modal>
    </div>
  );
};

export default EditProfile;
