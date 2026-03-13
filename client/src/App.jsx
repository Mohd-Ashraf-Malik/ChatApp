import React, { useContext } from "react";
import HomePage from "./page/HomePage"
import LoginPage from "./page/LoginPage"
import ProfilePage from "./page/ProfilePage"
import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast"
import { AuthContext } from "../context/AuthContext";

function App() {
    const {authUser} = useContext(AuthContext);
  

  return (
    <div className="bg-[url('https://cdn.svgator.com/images/2022/06/use-svg-as-background-image-particle-strokes.svg')] bg-contain">
      <Toaster />
      <Routes>
        <Route 
          path="/"
          element={authUser ? <HomePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to="/" />}
        />
        <Route
          path="/profile"
          element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
        />
      </Routes>
    </div>
  )
}

export default App
