import React, { useState, useEffect } from "react";
import Link from "next/link";
import useLogout from "../hooks/useLogout";
import useCheckLogin from "../hooks/useCheckLogin";

const Home = () => {
  const [role, setRole] = useState("");
  const { logOut, loading } = useLogout();
  useCheckLogin();
  useEffect(() => {
    setRole(localStorage.getItem("role"));
  }, []);

  return (
    <section>
      <h1>HOME</h1>
      <br />
      <LinkSection href="/khachs" buttonText="Go to customer list" />
      {role === "admin" && (
        <LinkSection href="/users" buttonText="Go to user list" />
      )}
      <LinkSection href="/profile" buttonText="Profile" />
      <button disabled={loading} onClick={logOut}>
        {loading ? "Logging out..." : "Log out"}
      </button>
    </section>
  );
};

const LinkSection = ({ href, buttonText }) => (
  <p>
    <Link href={href}>
      <button>{buttonText}</button>
    </Link>
  </p>
);

export default Home;
