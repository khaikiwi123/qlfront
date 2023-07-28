import { useRef } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import useLogin from "../hooks/useLogin";

const Login = () => {
  const {
    email,
    setEmail,
    password,
    setPassword,
    errMsg,
    loading,
    handleSubmit,
    togglePass,
    showPass,
  } = useLogin();

  const emailErrorMsg = errMsg === "Wrong password" ? "" : errMsg;
  const passwordErrorMsg = errMsg === "Wrong password" ? errMsg : "";

  return (
    <>
      <section>
        <h1>Sign In</h1>
        <form onSubmit={handleSubmit}>
          <TextField
            error={!!emailErrorMsg}
            helperText={emailErrorMsg}
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
            error={!!passwordErrorMsg}
            helperText={passwordErrorMsg}
            id="password"
            type={showPass ? "text" : "password"}
            label="Password"
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
          <Button
            color="inherit"
            style={{ height: "40px", width: "160px" }}
            variant="outlined"
            type="submit"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Log in"}
          </Button>
        </form>
      </section>
    </>
  );
};

export default Login;
