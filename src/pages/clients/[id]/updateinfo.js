import { useState, useRef } from "react";
import api from "../../../api/api";
import Link from "next/link";
import { useRouter } from "next/router";
import useCheckLogin from "../../../hooks/useCheckLogin";

const Update = () => {
  const msgRef = useRef();
  const router = useRouter();
  const id = router.query.id;
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [unit, setUnit] = useState("");
  const [represent, setRep] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useCheckLogin();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = {
      email,
      phone,
      unit,
      represent,
    };
    try {
      const response = await api.put(`/clients/${id}`, data);
      console.log(response);
      router.push(`/clients/${id}`);
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
        <label>Unit:</label>
        <input
          placeholder={""}
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
        />
        <label>Representer:</label>
        <input
          placeholder={""}
          value={represent}
          onChange={(e) => setRep(e.target.value)}
        />
        <button disabled={loading} onClick={handleSubmit}>
          {loading ? "Updating..." : "Update"}
        </button>
        <Link href={`/clients/${id}`}>
          <button>Back to clients profile</button>
        </Link>
      </div>
    </>
  );
};

export default Update;
