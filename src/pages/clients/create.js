import { useState, useEffect } from "react";
import api from "../../api/api";
import Link from "next/link";
import Router from "next/router";
import useCheckLogin from "../../hooks/useCheckLogin";
import TextField from "@mui/material/TextField";

const Create = () => {
  const [email, setEmail] = useState("");
  const [emailErr, setEmailErr] = useState("");

  const [phone, setPhone] = useState("");
  const [phoneErr, setPhoneErr] = useState("");

  const [unit, setUnit] = useState("");
  const [unitErr, setUnitErr] = useState("");

  const [represent, setRep] = useState("");
  const [representErr, setRepErr] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [id, setId] = useState("");
  useEffect(() => {
    setId(localStorage.getItem("currUser"));
    setRole(localStorage.getItem("role"));
  });
  useCheckLogin();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setEmailErr("");
    setPhoneErr("");
    setUnitErr("");
    setRepErr("");
    try {
      await api.post(`/clients`, {
        email,
        phone,
        unit,
        represent,
        createdBy: id,
      });
      Router.push("/clients/potential");
    } catch (error) {
      console.error(error);
      const errorMsg = error.response.data.error;

      if (errorMsg === "Please fill out all the form") {
        setEmailErr(email ? "" : "This field is required");
        setPhoneErr(phone ? "" : "This field is required");
        setUnitErr(unit ? "" : "This field is required");
        setRepErr(represent ? "" : "This field is required");
      } else if (
        errorMsg === "Client's email is already in the system" ||
        errorMsg === "Email isn't valid"
      ) {
        setEmailErr(errorMsg);
      } else if (errorMsg === "Client's number is already in the system") {
        setPhoneErr(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <div>
        <h1>Create client</h1>
        <form onSubmit={handleSubmit}>
          <TextField
            error={!!emailErr}
            helperText={emailErr}
            id="email"
            type="email"
            label="Email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            InputProps={{
              style: { height: "40px" },
            }}
            style={{ width: "280px" }}
          />
          <TextField
            error={!!phoneErr}
            helperText={phoneErr}
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            InputProps={{
              style: { height: "40px" },
            }}
            style={{ width: "280px" }}
          />
          <TextField
            error={!!representErr}
            helperText={representErr}
            placeholder="Representer"
            value={represent}
            onChange={(e) => setRep(e.target.value)}
            InputProps={{
              style: { height: "40px" },
            }}
            style={{ width: "280px" }}
          />
          <TextField
            error={!!unitErr}
            helperText={unitErr}
            placeholder="Unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            InputProps={{
              style: { height: "40px" },
            }}
            style={{ width: "280px" }}
          />
          <button disabled={loading} type="submit">
            {loading ? "Creating..." : "Create"}
          </button>
          {role === "admin" && (
            <Link href="/clients/all">
              <button>Back to client list</button>
            </Link>
          )}
          {role === "user" && (
            <Link href="/clients/potential">
              <button>Back to potential client list</button>
            </Link>
          )}
        </form>
      </div>
    </>
  );
};

export default Create;
