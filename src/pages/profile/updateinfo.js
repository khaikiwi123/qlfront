import { useEffect, useState, useRef } from "react";
import api from "../../api/api";
import Link from "next/link";
import Router from "next/router";
import useCheckLogin from "../../hooks/useCheckLogin";

const UpdateInfo = () => {
  const msgRef = useRef();
  const [id, setID] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  useCheckLogin();

  useEffect(() => {
    setID(localStorage.getItem("currID"));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = {
      name,
      phone,
      email,
    };

    try {
      const response = await api.put(`/users/${id}`, data);
      console.log(response);
      Router.push(`/profile/`);
    } catch (error) {
      console.error(error);
      setMsg(error.response.data.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div>
        <p
          ref={msgRef}
          className={msg ? "msg" : "offscreen"}
          aria-live="assertive"
        >
          {msg}
        </p>
        <h1>Update</h1>
        <label>Name:</label>
        <input
          placeholder={""}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <label>Email:</label>
        <input
          placeholder={""}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label>Phone:</label>
        <input
          placeholder={""}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <button disabled={loading} onClick={handleSubmit}>
          {loading ? "Updating..." : "Update"}
        </button>
        <Link href="/profile">
          <button>Back to your profile</button>
        </Link>
      </div>
    </>
  );
};

export default UpdateInfo;
