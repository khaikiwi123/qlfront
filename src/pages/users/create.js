import { useState, useRef } from "react";
import api from "../../api/api";
import Link from "next/link";
import Router from "next/router";
import useCheckLogin from "../../hooks/useCheckLogin";

const Register = () => {
  const errRef = useRef();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  useCheckLogin();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (password !== confirmPassword) {
      setErrMsg("Passwords do not match!");
      setLoading(false);
      return;
    }
    try {
      await api.post(`/users/`, {
        email,
        name,
        phone,
        role,
        password,
      });
      Router.push("/users");
    } catch (error) {
      console.error(error);
      setErrMsg(error.response.data.error);
    }
    setLoading(false);
  };
  const togglePass = () => {
    setShowPass(!showPass);
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
        <h1>Create User</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            pattern="[^@\s]+@[^@\s]+\.[^@\s]+"
            title="Invalid email"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="name"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="">Select role</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <input
            type={showPass ? "text" : "password"}
            placeholder="Password"
            value={password}
            pattern="(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,18}"
            title="Password must be at least 8, max 18, and contain at least 1 lower case, 1 upper case, 1 special character and no space"
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type={showPass ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button type="button" onClick={togglePass}>
            {showPass ? "Hide" : "Show"}
          </button>
          <button disabled={loading} type="submit">
            {loading ? "Creating..." : "Create"}
          </button>
          <Link href="/users/">
            <button>Back to users list</button>
          </Link>
        </form>
      </div>
    </>
  );
};

export default Register;
