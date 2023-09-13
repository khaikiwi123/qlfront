import { Modal } from "antd";

export const metaErr = (error) => {
  const { error: errorMsg } = error.response.data;

  let emailError = "";
  let phoneError = "";

  switch (errorMsg) {
    case "Email existed":
    case "Phone existed":
      showModal(
        "Người dùng đã tồn tại",
        "Xin vui lòng kiểm tra thông tin nhập"
      );
      break;
    case "Email isn't valid":
      emailError = "Email không hợp lệ";
      break;
    case "Phone isn't valid":
      phoneError = "Số điện thoại không hợp lệ";
      break;
    default:
      console.error("Unhandled error:", errorMsg);
      break;
  }

  return { emailError, phoneError };
};

const showModal = (title, content) => {
  Modal.error({
    title: title,
    content: content,
  });
};
