import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomeScreen from "./screens/home/HomeScreen";
import LoginScreen from "./screens/auth/login/LoginScreen";
import SignupScreen from "./screens/auth/signup/SignupScreen";
import AppPaths from "./lib/appPaths";
import ProductsPage from "./components/chatbody/ProductsPage";

export default function MyRoutes() {
  return (
    <Router>
      <Routes>
        <Route path={AppPaths.HOME} element={<HomeScreen />} />
        <Route path={AppPaths.CHAT_ROOM} element={<HomeScreen />} />
        <Route path={AppPaths.LOGIN} element={<LoginScreen />} />
        <Route path={AppPaths.SIGN_UP} element={<SignupScreen />} />
        <Route path={AppPaths.PRODUCTS_PAGE} element={<ProductsPage/>} />
      </Routes>
    </Router>
  );
}
