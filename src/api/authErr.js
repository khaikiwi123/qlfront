import { Modal } from "antd";
import Router from "next/router";

const authErr = (error, logOut) => {
  if (error.response) {
    if (error.response.status === 401) {
      Modal.error({
        title: "Session hết hạn",
        content: "Xin vui lòng đăng nhập lại!",
        onOk: logOut,
      });
    } else if (error.response.status === 403) {
      Modal.confirm({
        title: "Không có quyền truy cập",
        content: "Bạn không có quyền để truy cập vào trang này",
        okText: "Quay lại",
        cancelText: "Đăng xuất",
        onOk() {
          Router.push("/leads");
        },
        onCancel: logOut,
      });
    }
  } else {
    Modal.error({
      title: "Có lỗi bất ngờ",
      content: "Xin vui lòng thử lại sau",
    });
  }
  console.error(error);
};

export default authErr;
