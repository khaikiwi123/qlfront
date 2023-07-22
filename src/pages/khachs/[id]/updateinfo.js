import { useState, useRef } from "react";
import api from "../../../api/api";
import Link from "next/link";
import { useRouter } from "next/router";
import useCheckLogin from "../../../hooks/useCheckLogin";

const Update = () => {
  const msgRef = useRef();
  const router = useRouter();
  const id = router.query.id;
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useCheckLogin();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = {
      name,
      phone,
      address,
    };
    try {
      const response = await api.put(`/khachs/${id}`, data);
      console.log(response);
      router.push(`/khachs/${id}`);
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
        <label>Phone:</label>
        <input
          placeholder={""}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <label>Address:</label>
        <input
          placeholder={""}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <button disabled={loading} onClick={handleSubmit}>
          {loading ? "Updating..." : "Update"}
        </button>
        <Link href={`/khachs/${id}`}>
          <button>Back to customers profile</button>
        </Link>
      </div>
    </>
  );
};

export default Update;
