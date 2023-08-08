import { message } from "antd";
import Router from "next/router";

const checkLogin = () => {
  message.warning("You are not logged in!", 1.5);
  Router.push("/login");
};
export default checkLogin;
