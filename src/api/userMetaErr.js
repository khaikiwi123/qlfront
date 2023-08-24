import { Modal } from "antd";

export const metaErr = (error) => {
  const { error: errorMsg } = error.response.data;

  let emailError = "";
  let phoneError = "";

  switch (errorMsg) {
    case "Email existed":
    case "Phone existed":
      showModal("User existed", "Please double check inputs");
      break;
    case "Email isn't valid":
      emailError = errorMsg;
      break;
    case "Phone isn't valid":
      phoneError = errorMsg;
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
