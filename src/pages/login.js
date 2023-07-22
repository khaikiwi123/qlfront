import { useRef } from "react";
import useLogin from "../hooks/useLogin";

const Login = () => {
  const userRef = useRef();
  const errRef = useRef();
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

  return (
    <>
      <section>
        <p
          ref={errRef}
          className={errMsg ? "errmsg" : "offscreen"}
          aria-live="assertive"
        >
          {errMsg}
        </p>
        <h1>Sign In</h1>
        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email:</label>
          <input
            type="text"
            id="email"
            ref={userRef}
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            required
          />
          <label htmlFor="password">Password:</label>
          <input
            type={showPass ? "text" : "password"}
            id="password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            required
          />
          <button type="button" onClick={togglePass}>
            {showPass ? "Hide" : "Show"}
          </button>
          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>
      </section>
    </>
  );
};

export default Login;
