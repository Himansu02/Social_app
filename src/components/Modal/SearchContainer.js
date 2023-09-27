import React, { useEffect, useState } from "react";
import styles from "./SearchContainer.module.css";
import { Search } from "@mui/icons-material";
import { Link } from "react-router-dom";
import axios from "axios";
import Spinner from "../UI/Spinner";

const SearchContainer = ({ clickHandler }) => {
  const [imaginaryArray, setImaginaryArray] = useState([]);
  const [filteredArray, setFilteredArray] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getUsers = async () => {
      try {
        const res = await axios.get(
          "https://social-app-backend-idrz.onrender.com/user"
        );
        console.log(res);

        setImaginaryArray(res.data);
        setIsLoading(false);
      } catch (err) {
        console.log(err);
      }
    };
    getUsers();
  }, []);

  const handleChange = (e) => {
    if (e.target.value.trim().length === 0) {
      setFilteredArray([]);
      return;
    }
    setFilteredArray(() => {
      return imaginaryArray.filter((user) => {
        return user.username.startsWith(e.target.value);
      });
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.inputContainer}>
        <Search fontSize="large" />
        <input placeholder="Search" onChange={handleChange} />
      </div>
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
      {!isLoading && (
        <div className={styles.resultContainer}>
          {filteredArray.map((ele, idx) => {
            return (
              <Link
                className={styles.link}
                to={`/profile/${ele.externalId}`}
                onClick={() => {
                  clickHandler();
                }}
                key={idx}
              >
                <div className={styles.postHeader}>
                  <div className={styles.imageContainer}>
                    <img
                      className={styles.profilePicture}
                      src={ele.profile_img}
                      alt="User Profile"
                    />
                  </div>
                  <div className={styles.userInfo}>
                    <p className={styles.displayName}>{ele.fullname}</p>
                    <p className={styles.username}>{"@" + ele.username}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
      {!isLoading && filteredArray.length === 0 && (
        <div className={styles.noResultContainer}>
          <p>No Search Results.</p>
        </div>
      )}
    </div>
  );
};

export default SearchContainer;
