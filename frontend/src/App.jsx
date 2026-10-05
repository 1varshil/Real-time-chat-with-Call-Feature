import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import SignUp from "./pages/SignUp.jsx";
import Login from "./pages/Login.jsx";
import Home from "./pages/Home.jsx";
import Profile from "./pages/Profile.jsx";
import useCurrentUser from "./custom-hooks/getCurrentUser.jsx";
import { useSelector } from "react-redux";
import getOtherUsers from "./custom-hooks/getOtherUsers.jsx";
import getGroups from "./custom-hooks/getGroups.jsx";
import IncomingCallModal from "./components/Call/IncomingCallModal.jsx";
import ActiveCallWindow from "./components/Call/ActiveCallWindow.jsx";

function App() {
  useCurrentUser();
  getOtherUsers();
  getGroups();
  let { userData } = useSelector((state) => state.user);

  return (
    <>
      <Routes>
        <Route path="/" element={userData ? <Home /> : <Login />} />
        <Route path="/profile" element={userData ? <Profile /> : <SignUp />} />
        <Route path="/signup" element={!userData ? <SignUp /> : <Home />} />
        <Route path="/login" element={!userData ? <Login /> : <Home />} />
      </Routes>
      <IncomingCallModal />
      <ActiveCallWindow />
    </>
  );
}

export default App;
