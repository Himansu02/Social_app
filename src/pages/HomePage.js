import React, { Suspense, lazy, useEffect, useState } from "react";
import {
  Home,
  Explore,
  Notifications,
  MailOutline,
  TurnedIn,
  List,
  Person,
  Add,
  Search,
  Message,
} from "@mui/icons-material";
import styles from "./HomePage.module.css";
import Timeline from "./Timeline";
import { Outlet, Link } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";
import { Modal } from "@mui/material";
import NewPost from "../components/Modal/NewPost";
import { UserButton, useUser, useAuth } from "@clerk/clerk-react";
import { collection, addDoc, getDocs, where, query } from "firebase/firestore";
import axios from "axios";
import { getAuth, signInWithCustomToken } from "firebase/auth";
import { app, auth } from "../Firebase";
import SearchContainer from "../components/Modal/SearchContainer";
import { getCurrentUser } from "../components/redux/userReducer";
import Spinner from "../components/UI/Spinner";
const ChatContainer = lazy(() => import("./ChatContainer"));

const Conversation = lazy(() => import("./Conversation"));

const HomePage = () => {
  const { user } = useUser();
  const openChat = useSelector((state) => state.chat.openChat);
  const [openPost, setOpenPost] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);
  const [open, setOpen] = useState(false);
  const socket = useSelector((state) => state.socket.socket);
  const dispatch = useDispatch();
  const [count, setCount] = useState(0);
  const [prevScrollPos, setPrevScrollPos] = useState(window.scrollY);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const res = await axios.get(
        `https://social-app-backend-idrz.onrender.com/user/${user.id}`
      );
      dispatch(getCurrentUser(res.data));
    };
    fetchUser();
  }, []);

  useEffect(() => {
    socket.emit("newUser", user.id);
  }, []);

  useEffect(() => {
    socket.on("getNotification", (data) => {
      setCount((prev) => {
        return prev + 1;
      });
    });
  }, []);

  const handleScroll = () => {
    const currentScrollPos = window.scrollY;
    setVisible(prevScrollPos > currentScrollPos);
    setPrevScrollPos(currentScrollPos);
  };

  const handleClose = () => {
    setOpen(false);
    setOpenPost(false);
    setOpenSearch(false);
  };

  const handleOpenPost = () => {
    setOpen(true);
    setOpenPost(true);
  };

  const handleOpenSearch = () => {
    setOpen(true);
    setOpenSearch(true);
  };

  const handleNotificationClick = () => {
    setCount(0);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [prevScrollPos, visible]);

  const navigationLinks = [
    {
      icon: (
        <Link to="/">
          <Home className={styles.icon} fontSize="large" />
        </Link>
      ),
      name: "Home",
    },
    {
      icon: (
        <Link to={`/notifiaction/${user.id}`}>
          <div
            className={styles.notificationContainer}
            onClick={handleNotificationClick}
          >
            <Notifications className={styles.icon} fontSize="large" />
            {count > 0 && (
              <div className={styles.count}>
                <span>{count}</span>
              </div>
            )}
          </div>
        </Link>
      ),
      name: "Notifications",
    },
    {
      icon: (
        <Link to={`/profile/${user.id}`}>
          <Person className={styles.icon} fontSize="large" />
        </Link>
      ),
      name: "Profile",
    },
    {
      icon: (
        <Search
          className={styles.icon}
          fontSize="large"
          onClick={handleOpenSearch}
        />
      ),
      name: "Search",
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.navigation}>
        <div className={styles.userButtonContainer}>
          <UserButton />
          <span className={styles.fullName}>{user.fullName}</span>
        </div>
        {navigationLinks.map((link, index) => (
          <div className={styles.menuItem} key={index}>
            <span>{link.icon}</span>
            <span className={styles.linkName}>{link.name}</span>
          </div>
        ))}
        <button
          type="button"
          className={styles.button}
          onClick={handleOpenPost}
        >
          Post
        </button>
      </div>
      <Modal onClose={handleClose} open={open} className={styles.test}>
        <div className={styles.modalContainer}>
          {openPost && <NewPost closeModal={handleClose} />}
          {openSearch && <SearchContainer clickHandler={handleClose} />}
        </div>
      </Modal>
      <div className={styles.content}>
        <Outlet />
      </div>
      <div className={styles.chatArea}>
        <Suspense
          fallback={
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Spinner />
            </div>
          }
        >
          {!openChat && <ChatContainer />}
          {openChat && <Conversation />}
        </Suspense>
      </div>
      <div
        className={`${styles.bottomNavbar} ${
          visible ? styles.visible : styles.hidden
        }`}
      >
        <UserButton />
        {navigationLinks.map((link, index) => (
          <div key={index}>
            <span>{link.icon}</span>
          </div>
        ))}

        <div onClick={handleOpenPost}>
          <span>
            <Add fontSize="large" />
          </span>
        </div>
        <div>
          <span>
            <Link to={"/chatBox"} className={styles.link}>
              <Message fontSize="large" />
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
