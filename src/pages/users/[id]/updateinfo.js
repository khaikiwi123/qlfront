import { useState, useRef } from "react";
import api from "../../../api/api";
import Link from "next/link";
import { useRouter } from "next/router";
import useCheckLogin from "../../../hooks/useCheckLogin";

const UpdateUserInfo = () => {
  const msgRef = useRef();
  const [name, setName] = useState(" ");
  const [phone, setPhone] = useState(" ");
  const [email, setEmail] = useState(" ");
  const [msg, setMsg] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [loadingUpdate, setUpdate] = useState(false);

  const router = useRouter();
  const id = router.query.id;

  useCheckLogin();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdate(true);
    const data = {
      name,
      phone,
      email,
    };

    if (selectedRole !== "") {
      data.role = selectedRole;
    }

    try {
      const response = await api.put(`/users/${id}`, data);
      console.log(response);
      router.push(`/users/${id}`);
    } catch (error) {
      console.error(error);
      setMsg(error.response.data.error);
    } finally {
      setUpdate(false);
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
        <label>email:</label>
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
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
        >
          <option value="">Select role</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <button disabled={loadingUpdate} onClick={handleSubmit}>
          {loadingUpdate ? "Updating..." : "Update"}
        </button>
        <Link href={`/users/${id}`}>
          <button>Back to user&apos;s profile</button>
        </Link>
      </div>
    </>
  );
};

export default UpdateUserInfo;
