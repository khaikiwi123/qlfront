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
    const message = `A sale person is alerady in charge of this ${objectType.toLowerCase()}.`;
    showModal("Lead existed", message);
  } else {
    switch (errorMsg) {
      case "Email existed":
      case "Phone existed":
        const message = customerId ? (
          <>
            {`${objectType} existed. `}
            <span
              style={{
                textDecoration: "underline",
                cursor: "pointer",
              }}
              onClick={() =>
                window.open(`/${objectUrlPath}/${customerId}`, "_blank")
              }
            >
              View {objectType.toLowerCase()}&apos;s profile
            </span>
          </>
        ) : (
          errorMsg
        );
        showModal("Lead existed", message);
        break;
      case "Email isn't valid":
        emailError = errorMsg;
        break;
      case "Phone isn't valid":
        phoneError = errorMsg;
        break;
      case "Sale user doesn't exist":
        showModal("Invalid Entry", <>Sale person doesn&apos;t exist</>);
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
