import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { Modal } from "antd";

const useLogout = () => {
  const router = useRouter();
  const [loading, setLoadingOut] = useState(false);

  const logOut = async (e) => {
    setLoadingOut(true);
    const token = localStorage.getItem("refresh_token");

    try {
      const response = await axios.post(
        `https://83vr7x9yp1.execute-api.ap-southeast-2.amazonaws.com/Prod/auth/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingOut(false);
      localStorage.clear();
      Modal.success({
        content: "You have been logged out.",
        onOk() {
          router.push("/login");
        },
      });
    }
  };

  return { logOut, loading };
};

export default useLogout;
