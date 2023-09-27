import React, { useEffect, useState } from "react";
import QuotePost from "../components/main/QuotePost";
import styles from "./Timeline.module.css";
import { Link } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { getAllPost } from "../components/redux/postReducer";
import InfiniteScroll from "react-infinite-scroll-component";
import LoadingSpinner from "../components/UI/LoadingSpinner";
import Spinner from "../components/UI/Spinner";

function Timeline() {
  const [selectedSection, setSelectedSection] = useState("all");
  const [hasMore, setHasMore] = useState(true); // Track if there are more posts to load
  const [page, setPage] = useState(1); // Track the current page
  const allPosts = useSelector((state) => state.post.postArray);
  const [filteredArray, setFilteredArray] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const dispatch = useDispatch();
  const postsPerPage = 3;

  useEffect(() => {
    // Fetch initial posts
    const getPost = async () => {
      const res = await axios.get(
        `https://social-app-backend-idrz.onrender.com/post?page=${page}&limit=${postsPerPage}`
      );
      if (res.data.length === 0) {
        setHasMore(false); // No more posts to load
      } else {
        dispatch(getAllPost(res.data));
      }
      setIsLoading(false);
    };
    getPost();
  }, [page]);

  const compare = (a, b) => {
    return b.like.length - a.like.length;
  };

  const loadMore = () => {
    console.log("called");
    setPage(page + 1);
  };

  useEffect(() => {
    setFilteredArray(
      selectedSection === "all"
        ? allPosts
        : (() => {
            let tempArray = [...allPosts];
            tempArray.sort(compare);
            return tempArray.filter((obj) => {
              return (
                new Date(obj.createdAt) > new Date() - 24 * 60 * 60 * 1000 &&
                obj.like.length > 0
              );
            });
          })()
    );
  }, [allPosts, selectedSection]);

  return (
    <div className={styles.timeline}>
      <div className={styles.title}>Home</div>
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${
            selectedSection === "all" ? styles.activeTab : ""
          }`}
          onClick={() => setSelectedSection("all")}
        >
          ALL
        </button>
        <button
          className={`${styles.tab} ${
            selectedSection === "trending" ? styles.activeTab : ""
          }`}
          onClick={() => {
            setSelectedSection("trending");
          }}
        >
          TRENDING
        </button>
      </div>
      <InfiniteScroll
        dataLength={filteredArray.length}
        next={loadMore}
        hasMore={hasMore}
        loader={() => setIsLoading(true)}
      >
        {filteredArray?.map((post, index) => (
          <QuotePost key={index} post={post} />
        ))}
      </InfiniteScroll>
      {isLoading && (
        <div
          style={{
            width: "100%",
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            marginTop: "50px",
          }}
        >
          <Spinner />
        </div>
      )}
      {!isLoading && filteredArray.length === 0 && (
        <div className={styles.noPostContainer}>
          <p>No Posts.</p>
        </div>
      )}
    </div>
  );
}

export default Timeline;
