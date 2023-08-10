import React from "react";

export const handleApiError = (error, role) => {
  const {
    error: errorMsg,
    id: clientId,
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
    const message = `${inChargeEmail} is in charge of this ${objectType.toLowerCase()}.`;
    if (errorMsg === "Email existed") {
      emailError = message;
    } else {
      phoneError = message;
    }
  } else {
    switch (errorMsg) {
      case "Email existed":
      case "Phone existed":
        const message = clientId ? (
          <>
            {`${objectType} existed. `}
            <span
              style={{
                textDecoration: "underline",
                cursor: "pointer",
              }}
              onClick={() =>
                window.open(`/${objectUrlPath}/${clientId}`, "_blank")
              }
            >
              View {objectType.toLowerCase()}'s profile
            </span>
          </>
        ) : (
          errorMsg
        );
        emailError = errorMsg === "Email existed" ? message : "";
        phoneError = errorMsg === "Phone existed" ? message : "";
        break;
      case "Email isn't valid":
        emailError = errorMsg;
        break;
      case "Sale user doesn't exist":
        saleError = errorMsg;
        break;
      default:
        console.error("Unhandled error:", errorMsg);
        break;
    }
  }

  return { emailError, phoneError, saleError };
};
