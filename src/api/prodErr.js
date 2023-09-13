import { Modal } from "antd";

export const metaErr = (error) => {
  const { error: errorMsg } = error.response.data;

  switch (errorMsg) {
    case "Product existed":
      showModal("Sản phẩm đã tồn tại", "Xin vui lòng kiểm tra thông tin nhập");
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
