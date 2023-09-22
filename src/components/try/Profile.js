import React, { useEffect, useState } from "react";
import styles from "./Profile.module.css";
import { Link, useParams } from "react-router-dom";
import QuotePost from "./QuotePost";
import Media from "./Media";
import { useUser } from "@clerk/clerk-react";
import axios from "axios";
import { Modal } from "@mui/material";
import EditProfile from "./EditProfile";
import { Cake, CalendarMonth, Place } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { getNewConversation, setOpenChart } from "./redux/chatReducer";

const Profile = () => {
  const [selectedSection, setSelectedSection] = useState("post");
  const [profileUser, setProfileUser] = useState(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);
  const [openEditProfile, setOpenEditProfile] = useState(false);
  const [userPosts, setUserPosts] = useState([]);
  const [media, setMedia] = useState([]);

  const socket=useSelector((state)=>state.socket.socket)
  
  const dispatch=useDispatch()

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
  const reduxUser=useSelector((state)=>state.user.user)
  // console.log(user)

  const { userId } = useParams();
  useEffect(() => {
    const getUserData = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/user/${userId}`);

        setProfileUser(res.data);
        setMedia(res.data.media);
      } catch (err) {
        console.log(err);
      }
    };
    getUserData();
  }, [userId]);

  useEffect(() => {
    const getTimelinePost = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/post/timeline/${userId}`
        );
        setUserPosts(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    getTimelinePost();
  }, [userId]);

  const handleStartChat=async()=>{
    try{
      const res=await axios.post("http://localhost:5000/conversation",{senderId:user.id,receiverId:userId})
      console.log(res.data)
      if(res.data.status==="new")
      {
        const newMessage = {
          conversationId: res.data.conversation._id,
          sender: user.id,
          text: "Hi",
        };
        dispatch(getNewConversation(res.data.conversation))
        const data=await axios.post("http://localhost:5000/message/",newMessage)

        socket.emit("sendMessage", {
          senderId: user.id,
          receiverId: userId,
          text: "Hi",
          conversationId:res.data.conversation._id,
        });
        dispatch(
          setOpenChart({
            openChat: true,
            id: res.data.conversation._id,
            conversationUser: profileUser,
          })
        );
      }else{
        dispatch(
          setOpenChart({
            openChat: true,
            id: res.data.conversation._id,
            conversationUser: profileUser,
            conversation:res.data.conversation
          })
        );
      }
    }catch(err){
      console.log(err)
    }
  }

  return (
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
            reduxUser?.cover_img
              ? reduxUser?.cover_img
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
                <button className={styles.button} onClick={handleStartChat}>Start a Chat</button>
              )}
            </div>
            <p className={styles.userName}>{"@" + profileUser?.username}</p>
            <div className={styles.personalInfoContainer}>
              {reduxUser?.bio && <p>{reduxUser?.bio}</p>}
              {reduxUser?.dob && (
                <div className={styles.iconContainer}>
                  <Cake /> <span>{reduxUser?.dob}</span>
                </div>
              )}
              {joinDate?.trim().length > 0 && (
                <div className={styles.iconContainer}>
                  <CalendarMonth /> <span>Joined in {joinDate}</span>
                </div>
              )}
              {reduxUser?.location && (
                <div className={styles.iconContainer}>
                  <Place /> <span>{reduxUser?.location}</span>
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
                {userPosts?.map((post, index) => (
                  <Link to="/post" className={styles.link} key={index}>
                    <QuotePost post={post} />
                  </Link>
                ))}
                <div className={styles.lastMsgContainer}>
                  <p>Add New Posts.</p>
                </div>
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
          </div>
        </div>
      </div>
      <Modal
        onClose={closeModal}
        open={selectedImageUrl || openEditProfile}
        style={{
          position: "absolute",
          boxShadow: "2px solid black",
          height: 700,
          width: 650,
          left: "30%",
          top: "5%",
          overflow: "auto",
        }}
      >
        <div className={styles.modalContainer}>
          {selectedImageUrl && (
            <div className={styles.selectedImageContainer} onClick={closeModal}>
              <img src={selectedImageUrl} alt="Selected" />
            </div>
          )}
          {openEditProfile && <EditProfile user={reduxUser} />}
        </div>
      </Modal>
    </div>
  );
};

export default Profile;
