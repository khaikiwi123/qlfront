import { useState, useEffect } from "react";
import api from "../api/api";
import { useRouter } from "next/router";

const useLogin = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loggedIn = localStorage.getItem("logged_in");
    const role = localStorage.getItem("role");
    if (loggedIn === "true") {
      if (role === "admin") {
        router.push("/users");
      } else {
        router.push("/leads");
      }
    }
  }, []);

  useEffect(() => {
    setErrMsg("");
  }, [email, password]);

  const setUserData = (data) => {
    localStorage.setItem("logged_in", "true");
    localStorage.setItem("access_token", data.access);
    localStorage.setItem("refresh_token", data.refresh);
    localStorage.setItem("currID", data.id);
    localStorage.setItem("role", data.role);
    localStorage.setItem("currUser", data.user);
  };

  const handleSubmit = async (e) => {
    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      console.log(response.data);
      setUserData(response.data);
      if (response.data.role === "admin") {
        router.push("/users");
      } else if (response.data.role === "user") {
        router.push("/leads");
      }
    } catch (error) {
      console.error(error);
      setErrMsg(error.response.data.error);
      setLoading(false);
    }
  };

  const togglePass = () => {
    setShowPass(!showPass);
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    errMsg,
    loading,
    handleSubmit,
    togglePass,
    showPass,
  };
};

export default useLogin;
