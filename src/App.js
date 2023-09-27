import { io } from "socket.io-client";
import { Suspense, lazy, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCurrentSocket } from "./components/redux/socketReducer";

import {
  RouterProvider,
  Route,
  Routes,
  Navigate,
  Link,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";

import NotFound from "./pages/NotFound";

import "./App.css";

import HomePage from "./pages/HomePage";

import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  UserButton,
  SignIn,
  SignUp,
  useUser,
  RedirectToSignIn,
} from "@clerk/clerk-react";
import LoadingSpinner from "./components/UI/LoadingSpinner";
import ChatContainer from "./pages/ChatContainer";
import Conversation from "./pages/Conversation";

const Timeline = lazy(() => import("./pages/Timeline"));

const Notification = lazy(() => import("./pages/Notification"));

const Post = lazy(() => import("./pages/Post"));

const Profile = lazy(() => import("./pages/Profile"));

const clerk_publisable_key = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/sign-in" element={<SignIn />} />
      <Route path="/sign-up" element={<SignUp />} />

      <Route
        path="/"
        element={
          <>
            <SignedIn>
              <Suspense
                fallback={
                  <div
                    style={{
                      width: "100%",
                      marginTop: "100px",
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <LoadingSpinner />
                  </div>
                }
              >
                <HomePage />
              </Suspense>
            </SignedIn>
            <SignedOut>
              <RedirectToSignIn />
            </SignedOut>
          </>
        }
      >
        <Route path="/" element={<Navigate replace to="/quotes" />} />

        <Route path="/quotes" element={<Timeline />} />

        <Route path="/notifiaction/:id" element={<Notification />} />

        <Route path="/chatBox" element={<ChatContainer />}/>
        <Route path="/chatBox/:convId" element={<Conversation/>}/>

        <Route path="/post/:postId" element={<Post />} />
        <Route path="/post/:postId/:commentId" element={<Post />} />

        <Route path="/profile/:userId" element={<Profile />} />

        <Route path="*" element={<NotFound></NotFound>} />
      </Route>
    </>
  )
);

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const socket = io("https://socail-app-api.vercel.app");
    // https://socail-app-api.vercel.app
    dispatch(getCurrentSocket(socket));
    return ()=>{
      socket?.disconnect()
    }
  }, []);

  const socket = useSelector((state) => state.socket.socket);
  console.log(socket);

  return (
    <ClerkProvider publishableKey={clerk_publisable_key}>
      <RouterProvider router={router} />
    </ClerkProvider>
  );
}

export default App;
