import React from "react";
import { Route, Navigate} from "react-router-dom";

const RouteGuard = () => {
  function hasJWT() {
    let flag = false;

    //check user has JWT token
    localStorage.getItem("token") ? (flag = true) : (flag = false);

    return flag;
  }

  return (
    hasJWT() ? (
      <Navigate to="/myprofile" />
    ) : (
      <Navigate to="/login" />
    )
  );
};

export default RouteGuard;
