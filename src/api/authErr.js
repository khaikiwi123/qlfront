import { Modal } from "antd";
import Router from "next/router";

const authErr = (error, logOut) => {
  if (error.response) {
    if (error.response.status === 401) {
      Modal.error({
        title: "Session expired",
        content: "Please log in again",
        onOk: logOut,
      });
    } else if (error.response.status === 403) {
      Modal.confirm({
        title: "Unauthorized Access",
        content: "You do not have permission to view this page",
        okText: "Go back",
        cancelText: "Logout",
        onOk() {
          Router.push("/leads");
        },
        onCancel: logOut,
      });
    }
  } else {
    Modal.error({
      title: "An error occurred",
      content: "Please try again later",
    });
  }
  console.error(error);
};

export default authErr;
