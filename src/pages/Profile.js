import React, { useEffect, useState } from "react";
import styles from "./Profile.module.css";
import { Link, useParams } from "react-router-dom";
import QuotePost from "../components/main/QuotePost";
import Media from "../components/main/Media";
import { useUser } from "@clerk/clerk-react";
import axios from "axios";
import { Modal } from "@mui/material";
import EditProfile from "../components/Modal/EditProfile";
import { Cake, CalendarMonth, Place } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import {
  getNewConversation,
  setOpenChart,
} from "../components/redux/chatReducer";
import InfiniteScroll from "react-infinite-scroll-component";
import Spinner from "../components/UI/Spinner";

const Profile = () => {
  const [selectedSection, setSelectedSection] = useState("post");
  const [profileUser, setProfileUser] = useState(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);
  const [openEditProfile, setOpenEditProfile] = useState(false);
  const [userPosts, setUserPosts] = useState([]);
  const [media, setMedia] = useState([]);
  const [hasMore, setHasMore] = useState(true); // Track if there are more posts to load
  const [page, setPage] = useState(1); // Track the current page
  const [isLoading, setIsLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);

  const postsPerPage = 4;

  const socket = useSelector((state) => state.socket.socket);

  const dispatch = useDispatch();

  const openModal = (image) => {
    setSelectedImageUrl(image);
  };

  const closeModal = () => {
    setSelectedImageUrl(null);
    setOpenEditProfile(false);
  };

  const handleOpenEditProfile = () => {
    setOpenEditProfile(true);
  };

  const formatDate = (inputDate) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    const date = new Date(inputDate);
    return date.toLocaleDateString(undefined, options);
  };

  useEffect(() => {
    console.log("Scrolling to top");
    window.scrollTo({
      top: 0,
      behavior: "smooth", // You can use 'auto' instead of 'smooth' for instant scrolling
    });
  }, []);

  const joinDate = formatDate(profileUser?.createdAt);

  const { user } = useUser();
  const reduxUser = useSelector((state) => state.user.user);
  // console.log(user)

  const loadMore = () => {
    console.log("called");
    setPage(page + 1);
  };

  const { userId } = useParams();

  useEffect(() => {
    if (user.id !== userId) {
      const getUserData = async () => {
        try {
          const res = await axios.get(
            `https://social-app-backend-idrz.onrender.com/user/${userId}`
          );

          setProfileUser(res.data);
          setMedia(res.data.media);
          setProfileLoading(false);
        } catch (err) {
          console.log(err);
        }
      };
      getUserData();
    } else {
      setProfileUser(reduxUser);
      setProfileLoading(false);
      setMedia(reduxUser.media);
    }
  }, [userId, reduxUser]);

  useEffect(() => {
    const getTimelinePost = async () => {
      try {
        const res = await axios.get(
          `https://social-app-backend-idrz.onrender.com/post/timeline/${userId}?page=${page}&limit=${postsPerPage}`
        );
        if (res.data.length === 0) {
          setHasMore(false); // No more posts to load
        } else {
          setUserPosts((prev) => [...prev, ...res.data]);
        }
        setIsLoading(false);
      } catch (err) {
        console.log(err);
      }
    };
    getTimelinePost();
  }, [page, userId]);

  const handleStartChat = async () => {
    try {
      const res = await axios.post(
        "https://social-app-backend-idrz.onrender.com/conversation",
        {
          senderId: user.id,
          receiverId: userId,
        }
      );
      console.log(res.data);
      if (res.data.status === "new") {
        const newMessage = {
          conversationId: res.data.conversation._id,
          sender: user.id,
          text: "Hi",
        };
        dispatch(getNewConversation(res.data.conversation));
        const data = await axios.post(
          "https://social-app-backend-idrz.onrender.com/message/",
          newMessage
        );

        socket.emit("sendMessage", {
          senderId: user.id,
          receiverId: userId,
          text: "Hi",
          conversationId: res.data.conversation._id,
        });
        dispatch(
          setOpenChart({
            openChat: true,
            id: res.data.conversation._id,
            conversationUser: profileUser,
          })
        );
      } else {
        dispatch(
          setOpenChart({
            openChat: true,
            id: res.data.conversation._id,
            conversationUser: profileUser,
            conversation: res.data.conversation,
          })
        );
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      {!profileLoading && (
        <div className={styles.container}>
          <div
            className={styles.coverImageContainer}
            onClick={() => {
              openModal(reduxUser?.cover_img);
            }}
          >
            <img
              className={styles.coverImage}
              src={
                profileUser?.cover_img
                  ? profileUser?.cover_img
                  : "https://dummyimage.com/1920x1080/aaa/ffffff.png&text=No+Photo"
              }
              alt="Cover-img"
            />
          </div>
          <div className={styles.mainSection}>
            <div className={styles.profileHeader}>
              <div
                className={styles.proImageContainer}
                onClick={() => {
                  openModal(profileUser?.profile_img);
                }}
              >
                <img
                  className={styles.proImage}
                  src={profileUser?.profile_img}
                  alt="Profile-img"
                />
              </div>
              <div className={styles.profileInfoContainer}>
                <div className={styles.editSection}>
                  <p className={styles.displayName}>{profileUser?.fullname}</p>
                  {user.id === userId && (
                    <button
                      className={styles.button}
                      onClick={handleOpenEditProfile}
                    >
                      Edit Profile
                    </button>
                  )}
                  {user.id !== userId && (
                    <button className={styles.button} onClick={handleStartChat}>
                      Start a Chat
                    </button>
                  )}
                </div>
                <p className={styles.userName}>{"@" + profileUser?.username}</p>
                <div className={styles.personalInfoContainer}>
                  {profileUser?.bio && <p>{profileUser?.bio}</p>}
                  {profileUser?.dob && (
                    <div className={styles.iconContainer}>
                      <Cake /> <span>{profileUser?.dob}</span>
                    </div>
                  )}
                  {joinDate?.trim().length > 0 && (
                    <div className={styles.iconContainer}>
                      <CalendarMonth /> <span>Joined in {joinDate}</span>
                    </div>
                  )}
                  {profileUser?.location && (
                    <div className={styles.iconContainer}>
                      <Place /> <span>{profileUser?.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className={styles.mainBottomSection}>
              <div className={styles.tabs}>
                <button
                  className={`${styles.tab} ${
                    selectedSection === "post" ? styles.activeTab : ""
                  }`}
                  onClick={() => setSelectedSection("post")}
                >
                  Post
                </button>
                <button
                  className={`${styles.tab} ${
                    selectedSection === "media" ? styles.activeTab : ""
                  }`}
                  onClick={() => setSelectedSection("media")}
                >
                  Media
                </button>
              </div>
              <div className={styles.contentContainer}>
                {selectedSection === "post" && (
                  <div>
                    <InfiniteScroll
                      dataLength={userPosts.length}
                      next={loadMore}
                      hasMore={hasMore}
                      loader={() => setIsLoading(true)}
                    >
                      {userPosts?.map((post, index) => (
                        <QuotePost post={post} key={index} />
                      ))}
                    </InfiniteScroll>
                    {userPosts.length === 0 && (
                      <div className={styles.noPostContainer}>
                        <p>No Posts.</p>
                      </div>
                    )}
                  </div>
                )}
                {selectedSection === "media" && (
                  <div>
                    {media.length > 0 && <Media images={media} />}
                    {media.length === 0 && (
                      <div className={styles.noMediaContainer}>
                        <p>No Media.</p>
                      </div>
                    )}
                  </div>
                )}
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
            </div>
          </div>
          <Modal
            onClose={closeModal}
            open={selectedImageUrl || openEditProfile}
            className={styles.test}
          >
            <div className={styles.modalContainer}>
              {selectedImageUrl && (
                <div
                  style={{
                    width: "100%",
                    height: "90vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <div
                    className={styles.selectedImageContainer}
                    onClick={closeModal}
                  >
                    <img src={selectedImageUrl} alt="Selected" />
                  </div>
                </div>
              )}
              {openEditProfile && (
                <EditProfile user={reduxUser} handleClose={closeModal} />
              )}
            </div>
          </Modal>
        </div>
      )}
      {profileLoading && (
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            padding: "50px",
            height: "100vh",
          }}
        >
          <Spinner />
        </div>
      )}
    </>
  );
};

export default Profile;
