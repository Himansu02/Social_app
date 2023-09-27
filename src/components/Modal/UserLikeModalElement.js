import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./UserLikeModalElement.module.css";
import axios from "axios";
import Spinner from "../UI/Spinner";

const UserLikeModalElement = ({ id }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const res = await axios.get(
        `https://social-app-backend-idrz.onrender.com/user/${id}`
      );
      setUser(res.data);
      setIsLoading(false);
    };
    getUser();
  }, [id]);

  return (
    <>
      {!isLoading && (
        <Link className={styles.link} to={`/profile/${user?.externalId}`}>
          <div className={styles.postHeader}>
            <div className={styles.imageContainer}>
              <img
                className={styles.profilePicture}
                src={user?.profile_img}
                alt="User Profile"
              />
            </div>
            <div className={styles.userInfo}>
              <p className={styles.displayName}>{user?.fullname}</p>
              <p className={styles.username}>{"@" + user?.username}</p>
            </div>
          </div>
        </Link>
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
    </>
  );
};

export default UserLikeModalElement;
