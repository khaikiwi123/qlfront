import { useEffect, useState } from "react";
import api from "../../api/api";
import Link from "next/link";
import useCheckLogin from "../../hooks/useCheckLogin";
import TextField from "@mui/material/TextField";
import Router from "next/router";

const UpdateUserPW = () => {
  const [id, setID] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPassErr, setNewPassErr] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [oldPassErr, setOldPassErr] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmErr, setConfirmErr] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loadingUpdate, setUpdate] = useState(false);
  useCheckLogin();
  useEffect(() => {
    setID(localStorage.getItem("currID"));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNewPassErr("");
    setOldPassErr("");
    setConfirmErr("");
    setUpdate(true);
    if (newPassword.trim() !== confirmPassword.trim()) {
      setConfirmErr("Passwords do not match!");
      setUpdate(false);
    }
    const data = {
      newPassword,
      oldPassword,
    };

    try {
      const response = await api.put(`/users/${id}`, data);
      console.log(response);
      Router.push("/profile");
    } catch (error) {
      console.error(error);
      const errMsg = error.response.data.error;
      if (errMsg === "Please fill out all the form.") {
        setOldPassErr(oldPassword ? "" : "This field is required");
        setNewPassErr(newPassword ? "" : "This field is required");
        setConfirmErr(confirmPassword ? "" : "This field is required");
      } else if (
        errMsg === "Password is too long" ||
        errMsg === "Password isn't strong enough"
      ) {
        setNewPassErr(errMsg);
      } else if (errMsg === "Old password is incorrect") {
        setOldPassErr(errMsg);
      }
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
        <h2>Update Password</h2>
        <form onSubmit={handleSubmit}>
          <TextField
            error={!!oldPassErr}
            helperText={oldPassErr}
            type={showPass ? "text" : "password"}
            placeholder="Old Password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            InputProps={{
              style: { height: "40px" },
            }}
            style={{ width: "280px" }}
          />
          <TextField
            error={!!newPassErr}
            helperText={newPassErr}
            type={showPass ? "text" : "password"}
            placeholder="New Password"
            value={newPassword}
            pattern="(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,24}"
            title="Password must be at least 8 and contain at least 1 lower case, 1 upper case, 1 special character and no space"
            onChange={(e) => setNewPassword(e.target.value)}
            InputProps={{
              style: { height: "40px" },
            }}
            style={{ width: "280px" }}
          />
          <TextField
            error={!!confirmErr}
            helperText={confirmErr}
            type={showPass ? "text" : "password"}
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            InputProps={{
              style: { height: "40px" },
            }}
            style={{ width: "280px" }}
          />
          <button type="button" onClick={togglePass}>
            {showPass ? "Hide" : "Show"}
          </button>
          <button disabled={loadingUpdate} type="submit">
            {loadingUpdate ? "Updating..." : "Update"}
          </button>
          <Link href={`/profile/`}>
            <button>Back to profile</button>
          </Link>
        </form>
      </div>
    </>
  );
};

export default UpdateUserPW;
