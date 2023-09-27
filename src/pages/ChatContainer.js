// import React from 'react';
// import UserList from './UserList';
// import Conversation from './Conversation';

// const ChatContainer=()=> {
//   return (
//     <div className={styles.chatContainer}>
//       <UserList />
//       <Conversation />
//     </div>
//   );
// }

// export default ChatContainer;
import React, { useEffect, useState } from "react";
import UserList from "../components/main/UserList";
import styles from "./ChatContainer.module.css";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { useUser } from "@clerk/clerk-react";
import { getList, getOnlineUsers } from "../components/redux/chatReducer";
import OnlieUsers from "../components/main/OnlieUsers";
import { Search } from "@mui/icons-material";
import Spinner from "../components/UI/Spinner";

const ChatContainer = () => {
  const { user } = useUser();
  const dispatch = useDispatch();
  const [friendUsersOnline, setFriendUsersOnline] = useState([]);
  const conversations = useSelector((state) => state.chat.userMessageList);
  const socket = useSelector((state) => state.socket.socket);
  const onlineUsers = useSelector((state) => state.chat.onlineUsers);
  const [searchName, setSearchName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (conversations.length === 0) {
      const getConversationList = async () => {
        try {
          const res = await axios.get(
            `https://social-app-backend-idrz.onrender.com/conversation/${user.id}`
          );
          dispatch(getList(res.data));
          setIsLoading(false);
        } catch (err) {
          console.log(err);
        }
      };
      getConversationList();
    } else {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    socket.on("getOnlineUsers", (data) => {
      // console.log(data)
      dispatch(getOnlineUsers(data));
    });
  }, []);

  useEffect(() => {
    const userIdsArray1 = [].concat(...conversations.map((obj) => obj.members));

    // Use filter to find objects in array1 with common userId values
    const commonObjects = onlineUsers.filter(
      (obj2) => userIdsArray1.includes(obj2.userId) && obj2.userId !== user.id
    );

    // console.log(commonObjects);

    setFriendUsersOnline(commonObjects);
  }, [conversations, onlineUsers]);

  const handleChange = (e) => {
    setSearchName(e.target.value);
  };

  return (
    <>
      <div className={styles.chatContainer}>
        <h1 className={styles.heading}>Messages</h1>
        <div className={styles.inputContainer}>
          <input placeholder="Search" onChange={handleChange} />
          <Search fontSize="large" />
        </div>
        {friendUsersOnline.length > 0 && (
          <div className={styles.onlineUserContainer}>
            {friendUsersOnline.map((user) => {
              // console.log(user);
              return <OnlieUsers key={user.userId} userId={user.userId} />;
            })}
          </div>
        )}
        {!isLoading && <UserList searchName={searchName} />}
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
        {conversations.length === 0 && !isLoading && (
          <div className={styles.noCoversationContainer}>
            <p>No Conversation.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default ChatContainer;
