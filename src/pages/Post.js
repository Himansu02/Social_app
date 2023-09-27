import React, { useEffect, useRef, useState } from "react";
import styles from "./Post.module.css";
import CommentSection from "../components/main/CommentSection";
import {
  Favorite,
  FavoriteBorder,
  KeyboardBackspace,
  ModeComment,
  Send,
} from "@mui/icons-material";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useUser } from "@clerk/clerk-react";
import axios from "axios";
import {
  CarouselProvider,
  Slider,
  Slide,
  ButtonBack,
  ButtonNext,
} from "pure-react-carousel";
import "pure-react-carousel/dist/react-carousel.es.css";
import PostImage from "../components/main/PostImage";
import CarouselComponent from "../components/main/CarouselComponent";
import { Modal } from "@mui/material";
import SearchContainer from "../components/Modal/SearchContainer";
import UserLikeModal from "../components/Modal/UserLikeModal";
import InfiniteScroll from "react-infinite-scroll-component";
import Comment from "../components/main/Comment";
import Spinner from "../components/UI/Spinner";

const Post = () => {
  const [post, setPost] = useState(null);
  const { user } = useUser();
  const socket = useSelector((state) => state.socket.socket);
  const [postComments, setPostComments] = useState([]);
  const [postLikes, setPostLikes] = useState([]);

  const [scrollToComment, setScrollToComment] = useState(null);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [mentionUsers, setMentionUsers] = useState([]); // List of users for mention suggestions
  const [mentionText, setMentionText] = useState(""); // Text entered for mention
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [hasMore, setHasMore] = useState(true); // Track if there are more posts to load
  const [page, setPage] = useState(1); // Track the current page
  const [isLoading, setIsLoading] = useState(true);

  const [postLoading, setPostLoading] = useState(true);

  const postsPerPage = 3;

  const [liked, setLiked] = useState(false);

  const params = useParams();
  const commentId = params.commentId;

  const postId = params.postId;

  const reduxUser = useSelector((state) => state.user.user);

  const loadMore = () => {
    console.log("called");
    setPage(page + 1);
  };

  const handleCommentDelete = (id) => {
    setPostComments((prev) => {
      return prev.filter((com) => {
        return com._id !== id;
      });
    });
  };

  useEffect(() => {
    if (commentId) {
      // Set the scroll target when commentId changes
      setScrollToComment(commentId);
    } else {
      // Clear the scroll target when commentId is null
      setScrollToComment(null);
    }
  }, [commentId]);

  useEffect(() => {
    const getAllUsers = async () => {
      const res = await axios.get(
        "https://social-app-backend-idrz.onrender.com/user"
      );
      setAllUsers(res.data);
    };
    getAllUsers();
  }, []);

  useEffect(() => {
    if (postId) {
      const getPostData = async () => {
        const res = await axios.get(
          `https://social-app-backend-idrz.onrender.com/post/${postId}`
        );
        setPost(res.data);
        setLiked(res.data.like.includes(user.id));
        setPostLikes(res.data.like);
        setPostLoading(false);
      };
      getPostData();
    }
  }, [postId]);

  useEffect(() => {
    // Scroll to the comment when scrollToComment is set
    if (scrollToComment) {
      console.log("working");
      const targetElement = document.getElementById(scrollToComment);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth" });
        targetElement.classList.add(styles.highlightedComment);

        // Remove the highlight after a certain time (e.g., 3 seconds)
        setTimeout(() => {
          targetElement.classList.remove(styles.highlightedComment);
        }, 3000);
      }
    }
  }, [scrollToComment, post]);

  useEffect(() => {
    const getPostComment = async () => {
      try {
        const res = await axios.get(
          `https://social-app-backend-idrz.onrender.com/comment/${postId}?page=${page}&limit=${postsPerPage}`
        );
        if (res.data.length === 0) {
          setHasMore(false); // No more posts to load
        } else {
          setPostComments((prev) => [...prev, ...res.data]);
        }
        setIsLoading(false);
      } catch (err) {
        console.log(err);
      }
    };
    getPostComment();
  }, [page]);

  let timestamp = "";

  const calculateTimeAgo = () => {
    const parsedTimestamp = new Date(post?.createdAt);
    const currentTime = new Date();
    const timeDifference = currentTime - parsedTimestamp;
    const seconds = Math.floor(timeDifference / 1000);

    if (seconds < 60) {
      timestamp = "just now";
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      timestamp = `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
    } else if (seconds < 86400) {
      const hours = Math.floor(seconds / 3600);
      timestamp = `${hours} hour${hours === 1 ? "" : "s"} ago`;
    } else if (seconds < 604800) {
      const days = Math.floor(seconds / 86400);
      timestamp = `${days} day${days === 1 ? "" : "s"} ago`;
    } else if (seconds < 2419200) {
      const weeks = Math.floor(seconds / 604800);
      timestamp = `${weeks} week${weeks === 1 ? "" : "s"} ago`;
    } else if (seconds < 29030400) {
      const months = Math.floor(seconds / 2419200);
      timestamp = `${months} month${months === 1 ? "" : "s"} ago`;
    } else {
      const years = Math.floor(seconds / 29030400);
      timestamp = `${years} year${years === 1 ? "" : "s"} ago`;
    }
  };

  calculateTimeAgo();

  const ref = useRef(null);

  const handleLike = async () => {
    const notification = {
      externalId: post?.postedBy.externalId,
      senderId: user.id,
      postId: postId,
      type: 1,
    };

    if (!liked) {
      socket?.emit("sendNotification", {
        senderId: user.id,
        receiverId: post?.postedBy.externalId,
        type: 1,
        postId: postId,
      });

      setPostLikes((prev) => {
        return [...prev, user.id];
      });
      setLiked(!liked);
      try {
        const res = await axios.put(
          `https://social-app-backend-idrz.onrender.com/post/${postId}/like`,
          { userId: user.id }
        );
      } catch (err) {
        console.log(err);
      }

      try {
        const res = await axios.post(
          `https://social-app-backend-idrz.onrender.com/notification`,
          notification
        );
      } catch (err) {
        console.log(err);
      }
    }
    if (liked) {
      setPostLikes((prev) => {
        return prev.filter((id) => {
          return id !== user.id;
        });
      });

      setLiked(!liked);

      try {
        const res = await axios.put(
          `https://social-app-backend-idrz.onrender.com/post/${postId}/unlike`,
          { userId: user.id }
        );
      } catch (err) {}

      try {
        const res = await axios.delete(
          `https://social-app-backend-idrz.onrender.com/notification`,
          notification
        );
      } catch (err) {
        console.log(err);
      }
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleCommentSubmit = async () => {
    if (ref.current.innerHTML.trim().length > 0) {
      const newComment = {
        postId,
        senderId: user.id,
        receiverId: post?.postedBy.externalId,
        text: ref.current.innerHTML,
        likes: [],
      };

      try {
        const res = await axios.post(
          "https://social-app-backend-idrz.onrender.com/comment",
          newComment
        );

        setPostComments((prev) => {
          return [res.data, ...prev];
        });

        const notification = {
          postId,
          senderId: user.id,
          externalId: post?.postedBy.externalId,
          text: res.data.text,
          commentId: res.data._id,
          type: 2,
        };

        socket?.emit("sendNotification", {
          senderId: user.id,
          receiverId: post?.postedBy.externalId,
          type: 2,
          postId: postId,
          commentId: res.data._id,
          text: res.data.text,
        });

        try {
          const res = await axios.post(
            `https://social-app-backend-idrz.onrender.com/notification/`,
            notification
          );
        } catch (err) {
          console.log(err);
        }

        ref.current.value = "";
      } catch (err) {
        console.log(err);
      }
    }
  };

  // Handle input in the textarea for mentions
  const handleMentionInput = (e) => {
    ref.current.style.height = "auto";
    ref.current.style.height = `${e.target.scrollHeight}px`;

    const text = e.currentTarget.innerHTML;

    // Detect "@" symbol
    const mentionIndex = text.lastIndexOf("@");
    if (mentionIndex >= 0) {
      // Show the mention dropdown and filter users for suggestions
      const mentionUsername = text.slice(mentionIndex);

      setShowMentionDropdown(true);
      const searchText = mentionUsername.slice(1); // Remove "@" from the search text
      const filteredUsers = allUsers.filter((user) =>
        user.username.startsWith(searchText)
      );
      setMentionUsers(filteredUsers);
    } else {
      // Hide the mention dropdown
      setShowMentionDropdown(false);
    }

    // Check if the user is trying to delete content within an <a> tag
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);

    if (range.startContainer.nodeType === Node.TEXT_NODE) {
      const parentElement = range.startContainer.parentElement;

      // Check if the parent element is an <a> tag
      if (parentElement && parentElement.tagName.toLowerCase() === "a") {
        // Get the text content inside the <a> tag
        const linkText = parentElement.textContent;

        const textLength = parentElement.innerText.length;
        const caretPosition = range.startOffset;

        // If caret is at the beginning or end of the <a> tag content, remove the entire <a> tag
        if (caretPosition === 0 || caretPosition === textLength) {
          e.preventDefault(); // Prevent default backspace/delete behavior
          parentElement.remove(); // Remove the entire <a> tag
        }

        // Use 'linkText' to access the text content inside the <a> tag
        console.log("Text inside <a> tag:", linkText);
      }
    }
  };

  // Handle mention selection from the dropdown
  const handleMentionSelect = (username, externalId) => {
    const text = ref.current.innerHTML;
    const mentionIndex = text.lastIndexOf("@");
    const mentionTextWithLink = `<a className="${styles.mentionLink}" href="/profile/${externalId}">@${username}</a>`;

    const resultText = text.substring(0, mentionIndex) + mentionTextWithLink;

    // Clear mention-related state
    setMentionText(resultText);
    setShowMentionDropdown(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>
          <Link to="/" className={styles.link}>
            <KeyboardBackspace />
          </Link>
          Post
        </h1>
      </div>
      {!postLoading && (
        <div className={styles.post}>
          <div className={styles.postHeader}>
            <Link
              to={`/profile/${post?.postedBy.externalId}`}
              className={styles.link}
            >
              <div className={styles.imgContainer}>
                <img
                  className={styles.img}
                  src={post?.postedBy.profile_img}
                  alt=""
                />
              </div>
            </Link>
            <div className={styles.userInfo}>
              <p className={styles.displayName}>{post?.postedBy.fullname}</p>
              <p className={styles.username}>@{post?.postedBy.username}</p>
            </div>
          </div>
          <div className={styles.postContent}>{post?.desc}</div>

          {post?.image.length > 0 && (
            <CarouselComponent
              size={window.innerWidth <= 768 ? window.innerWidth - 55 : 770}
              height={window.innerWidth <= 768 ? 650 : null}
              images={post?.image}
            />
          )}

          <div className={styles.timestamp}>{timestamp}</div>
        </div>
      )}
      {postLoading && (
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            padding: "10px",
          }}
        >
          <Spinner />
        </div>
      )}
      <div className={styles.countContainer}>
        <div className={styles.likeCount}>
          <p
            onClick={() => {
              setOpen(true);
            }}
            style={{ cursor: "pointer" }}
          >
            {postLikes.length} Likes
          </p>
          <div
            className={`${styles.favorite} ${liked && styles.liked}`}
            onClick={handleLike}
          >
            {!liked && <FavoriteBorder />}
            {liked && <Favorite />}
          </div>
        </div>
        <div className={styles.replyCount}>
          <p>{postComments.length} Comments</p>
          <ChatBubbleOutlineIcon />
        </div>
      </div>
      <div className={styles.input}>
        <div className={styles.commentImgContainer}>
          <img className={styles.commentImg} src={user.imageUrl} alt="" />
        </div>
        <div className={styles.inputArea}>
          <div
            ref={ref}
            className={styles.textContainer}
            contentEditable="true"
            placeholder="Add Comment..."
            onInput={handleMentionInput}
            dangerouslySetInnerHTML={{ __html: mentionText }}
          ></div>
          {showMentionDropdown && (
            <div className={styles.mentionDropDown}>
              {mentionUsers.map((user) => (
                <div
                  key={user.id}
                  className={styles.mentionItem}
                  onClick={() =>
                    handleMentionSelect(user.username, user.externalId)
                  }
                >
                  <div className={styles.dropDownImageContainer}>
                    <img
                      className={styles.img}
                      src={user?.profile_img}
                      alt=""
                    />
                  </div>
                  {"@" + user.username}
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ cursor: "pointer" }} onClick={handleCommentSubmit}>
          <Send />
        </div>
      </div>
      <div className={styles.commentSection}>
        <InfiniteScroll
          dataLength={postComments.length}
          next={loadMore}
          hasMore={hasMore}
          loader={() => setIsLoading(true)}
        >
          {postComments?.map((comment, index) => {
            return (
              <Comment
                key={index}
                comment={comment}
                postId={postId}
                postUser={post?.postedBy.externalId}
                deleteHandler={handleCommentDelete}
              />
            );
          })}
        </InfiniteScroll>
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

        {postComments?.length === 0 && (
          <div className={styles.noCommentContainer}>
            <p>No Comments.</p>
          </div>
        )}
      </div>
      <Modal onClose={handleClose} open={open} className={styles.test}>
        <UserLikeModal array={postLikes} />
      </Modal>
    </div>
  );
};

export default Post;
