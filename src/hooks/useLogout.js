import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

const useLogout = () => {
  const router = useRouter();
  const [loading, setLoadingOut] = useState(false);

  const logOut = async (e) => {
    e.preventDefault();
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
    }
    setLoadingOut(false);
    localStorage.clear();
    router.push("/logout");
  };

  return { logOut, loading };
};

export default useLogout;
