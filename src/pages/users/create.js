import { useState } from "react";
import api from "../../api/api";
import Link from "next/link";
import Router from "next/router";
import useCheckLogin from "../../hooks/useCheckLogin";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import FormHelperText from "@mui/material/FormHelperText";

const Register = () => {
  const [email, setEmail] = useState("");
  const [emailErr, setEmailErr] = useState("");
  const [name, setName] = useState("");
  const [nameErr, setNameErr] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneErr, setPhoneErr] = useState("");
  const [role, setRole] = useState("");
  const [roleError, setRoleErr] = useState("");
  const [password, setPassword] = useState("");
  const [passErr, setPassErr] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmErr, setConfirmErr] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  useCheckLogin();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailErr("");
    setNameErr("");
    setPhoneErr("");
    setRoleErr("");
    setPassErr("");
    setConfirmErr("");
    setLoading(true);
    if (password !== confirmPassword) {
      setConfirmErr("Passwords do not match!");
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
      const errMsg = error.response.data.error;
      if (errMsg === "Please fill out all the form") {
        setEmailErr(email ? "" : "This field is required");
        setNameErr(name ? "" : "This field is required");
        setPhoneErr(phone ? "" : "This field is required");
        setRoleErr(role ? "" : "This field is required");
        setPassErr(password ? "" : "This field is required");
        setConfirmErr(confirmPassword ? "" : "This field is required");
      } else if (
        errMsg === "User already existed, please login." ||
        errMsg === "Email isn't valid"
      ) {
        setEmailErr(errMsg);
      } else if (
        errMsg === "Password is too long" ||
        errMsg === "Password isn't strong enough"
      ) {
        setPassErr(errMsg);
      } else if (errMsg === "Invalid role") {
        setRoleErr("Please select Role");
      }
    }
    setLoading(false);
  };
  const togglePass = () => {
    setShowPass(!showPass);
  };

  return (
    <>
      <div>
        <h1>Create User</h1>
        <form onSubmit={handleSubmit}>
          <TextField
            error={!!emailErr}
            helperText={emailErr}
            id="email"
            type="email"
            placeholder="Email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            InputProps={{
              style: { height: "40px" },
            }}
            style={{ width: "280px" }}
          />
          <TextField
            error={!!nameErr}
            helperText={nameErr}
            id="name"
            type="text"
            placeholder="Name"
            value={name}
            required
            onChange={(e) => setName(e.target.value)}
            InputProps={{
              style: { height: "40px" },
            }}
            style={{ width: "280px" }}
          />
          <TextField
            error={!!phoneErr}
            helperText={phoneErr}
            id="phone"
            type="tel"
            placeholder="Phone"
            value={phone}
            required
            onChange={(e) => setPhone(e.target.value)}
            InputProps={{
              style: { height: "40px" },
            }}
            style={{ width: "280px" }}
          />
          <FormControl
            error={!!roleError}
            style={{ width: "280px", marginTop: "-8px" }}
          >
            <Select
              labelId="role-label"
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              displayEmpty
              sx={{ height: "40px", mt: 1 }}
            >
              <MenuItem disabled value="">
                <em>Select role</em>
              </MenuItem>
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
            <FormHelperText>{roleError}</FormHelperText>
          </FormControl>
          <TextField
            error={!!passErr}
            helperText={passErr}
            id="password"
            type={showPass ? "text" : "password"}
            placeholder="Password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              style: { height: "40px" },
              endAdornment: (
                <IconButton
                  aria-label="toggle password visibility"
                  edge="end"
                  onClick={togglePass}
                >
                  {showPass ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              ),
            }}
            style={{ width: "280px" }}
          />
          <TextField
            error={!!confirmErr}
            helperText={confirmErr}
            id="confirmPassword"
            type={showPass ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirmPassword}
            required
            onChange={(e) => setConfirmPassword(e.target.value)}
            InputProps={{
              style: { height: "40px" },
              endAdornment: (
                <IconButton
                  aria-label="toggle password visibility"
                  edge="end"
                  onClick={togglePass}
                >
                  {showPass ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              ),
            }}
            style={{ width: "280px" }}
          />
          <Button variant="contained" disabled={loading} type="submit">
            {loading ? "Creating..." : "Create"}
          </Button>
          <Link href="/users/">
            <Button variant="contained">Back to users list</Button>
          </Link>
        </form>
      </div>
    </>
  );
};

export default Register;
