import { useState, useRef } from "react";
import api from "../../../api/api";
import Link from "next/link";
import { useRouter } from "next/router";
import useCheckLogin from "../../../hooks/useCheckLogin";

const UpdateUserPW = () => {
  const msgRef = useRef();
  const [newPassword, setNewPassword] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loadingUpdate, setUpdate] = useState(false);

  const router = useRouter();
  const id = router.query.id;

  useCheckLogin();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdate(true);
    if (newPassword.trim() !== confirmPassword.trim()) {
      setMsg("Passwords do not match!");
      setUpdate(false);
    }
    const data = {
      newPassword,
      oldPassword,
    };

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
  const togglePass = () => {
    setShowPass(!showPass);
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
        <h2>Update Password</h2>
        <input
          type={showPass ? "text" : "password"}
          placeholder="Old password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
        />
        <input
          type={showPass ? "text" : "password"}
          placeholder="New password"
          value={newPassword}
          pattern="(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,24}"
          title="Password must be at least 8 and contain at least 1 lower case, 1 upper case, 1 special character and no space"
          onChange={(e) => setNewPassword(e.target.value)}
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
        <button disabled={loadingUpdate} onClick={handleSubmit}>
          {loadingUpdate ? "Updating..." : "Update password"}
        </button>
        <Link href={`/users/${id}`}>
          <button>Back to user&apos;s profile</button>
        </Link>
      </div>
    </>
  );
};

export default UpdateUserPW;