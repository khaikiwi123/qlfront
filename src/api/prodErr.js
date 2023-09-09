import { Modal } from "antd";

export const metaErr = (error) => {
  const { error: errorMsg } = error.response.data;

  switch (errorMsg) {
    case "Product existed":
      showModal("Product existed", "Please double check inputs");
      break;

    default:
      console.error("Unhandled error:", errorMsg);
      break;
  }
};

const showModal = (title, content) => {
  Modal.error({
    title: title,
    content: content,
  });
};
