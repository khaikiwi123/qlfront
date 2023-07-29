import { useEffect, useState } from "react";
import api from "../../api/api";
import Link from "next/link";
import Router from "next/router";
import useCheckLogin from "../../hooks/useCheckLogin";
import TextField from "@mui/material/TextField";

const UpdateInfo = () => {
  const [id, setID] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [emailErr, setEmailErr] = useState("");
  const [loading, setLoading] = useState(false);
  useCheckLogin();

  useEffect(() => {
    setID(localStorage.getItem("currID"));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailErr("");
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
      const errorMsg = error.response.data.error;
      if (errorMsg === "Email already in use, please choose a different one.") {
        setEmailErr(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div>
        <h1>Update</h1>
        <form onSubmit={handleSubmit}>
          <TextField
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            InputProps={{
              style: { height: "40px" },
            }}
            style={{ width: "280px" }}
          />
          <TextField
            error={!!emailErr}
            helperText={emailErr}
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputProps={{
              style: { height: "40px" },
            }}
            style={{ width: "280px" }}
          />
          <TextField
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            InputProps={{
              style: { height: "40px" },
            }}
            style={{ width: "280px" }}
          />

          <button disabled={loading} type="submit">
            {loading ? "Updating..." : "Update"}
          </button>
          <Link href={`/profile/`}>
            <button>Back to profile</button>
          </Link>
        </form>
      </div>
    </>
  );
};

export default UpdateInfo;
