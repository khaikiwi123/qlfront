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
    const aToken = localStorage.getItem("access_token");
    const rToken = localStorage.getItem("refresh_token");

    if (aToken && rToken) {
      router.push("/home");
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
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      console.log(response.data);
      setUserData(response.data);
      router.push("/home");
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
