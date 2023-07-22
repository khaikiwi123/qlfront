import { useState, useRef, useEffect } from "react";
import api from "../../api/api";
import Link from "next/link";
import Router from "next/router";
import useCheckLogin from "../../hooks/useCheckLogin";

const Create = () => {
  const errRef = useRef();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [errMsg, setErrMsg] = useState("");
  useCheckLogin();
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/khachs`, {
        name,
        phone,
        address,
      });
      Router.push("/khachs");
    } catch (error) {
      console.error(error);
      setErrMsg(error.response.data.error);
    }
  };

  return (
    <>
      <div>
        <p
          ref={errRef}
          className={errMsg ? "errmsg" : "offscreen"}
          aria-live="assertive"
        >
          {errMsg}
        </p>
        <h1>Create Khach</h1>
        <form onSubmit={handleSubmit}>
          <input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <input
            placeholder="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <button type="submit">Create</button>
          <Link href="/khachs/">
            <button>Back to customer list</button>
          </Link>
        </form>
      </div>
    </>
  );
};

export default Create;
