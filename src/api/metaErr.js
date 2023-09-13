import React from "react";
import { Modal } from "antd";

export const metaErr = (error, role) => {
  const {
    error: errorMsg,
    id: customerId,
    incharge: inChargeEmail,
    type: objectType,
  } = error.response.data;

  const currUserEmail = localStorage.getItem("currUser");
  const objectUrlPath = objectType ? `${objectType.toLowerCase()}s` : "";

  let emailError = "";
  let phoneError = "";
  let saleError = "";

  if (
    (errorMsg === "Email existed" || errorMsg === "Phone existed") &&
    role !== "admin" &&
    currUserEmail !== inChargeEmail
  ) {
    const message = `Đã có người chịu trách nhiệm cho ${objectType.toLowerCase()} này.`;
    showModal("Lead đã tồn tại", message);
  } else {
    switch (errorMsg) {
      case "Email existed":
      case "Phone existed":
        const message = customerId ? (
          <>
            {`${objectType} đã tồn tại. `}
            <span
              style={{
                textDecoration: "underline",
                cursor: "pointer",
              }}
              onClick={() =>
                window.open(`/${objectUrlPath}/${customerId}`, "_blank")
              }
            >
              Xem thông tin chi tiết của {objectType.toLowerCase()} này.
            </span>
          </>
        ) : (
          errorMsg
        );
        showModal("Lead đã tồn tại", message);
        break;
      case "Email isn't valid":
        emailError = "Email không hợp lệ";
        break;
      case "Phone isn't valid":
        phoneError = "Số điện thoại không hợp lệ";
        break;
      case "Sale user doesn't exist":
        showModal("Thông tin không chính xác", <>Nhân viên không tồn tại</>);
        break;
      default:
        console.error("Unhandled error:", errorMsg);
        break;
    }
  }

  return { emailError, phoneError, saleError };
};

const showModal = (title, content) => {
  Modal.error({
    title: title,
    content: content,
  });
};
