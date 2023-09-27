import axios from "axios";
import React, { useEffect, useState } from "react";
import styles from "./OnlineUsers.module.css";
import Spinner from "../UI/Spinner";

const OnlieUsers = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getUserDetails = async () => {
      try {
        const res = await axios.get(
          `https://social-app-backend-idrz.onrender.com/user/${userId}`
        );
        setUser(res.data);
        setIsLoading(false);
      } catch (err) {
        console.log(err);
      }
    };
    getUserDetails();
  }, [userId]);

  return (
    <div className={styles.container}>
      {!isLoading && (
        <>
          <div className={styles.imgContainer}>
            <img className={styles.img} src={user?.profile_img} alt="" />
          </div>
          <div className={styles.greenDotContainer}></div>
        </>
      )}
      {isLoading && <Spinner />}
    </div>
  );
};

export default OnlieUsers;
