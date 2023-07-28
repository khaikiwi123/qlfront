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
      {role === "admin" && (
        <LinkSection href="/clients/all" buttonText="Go to all client list" />
      )}

      {role === "user" && (
        <LinkSection
          href="/clients/potential"
          buttonText="Go to potential clients list"
        />
      )}
      {role === "user" && (
        <LinkSection
          href="/clients/acquired"
          buttonText="Go to acquired clients list"
        />
      )}

      {role === "admin" && (
        <LinkSection href="/users" buttonText="Go to users list" />
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
