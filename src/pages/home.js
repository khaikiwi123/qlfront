import React, { useState, useEffect } from "react";
import { Button, Typography, Layout } from "antd";
import Link from "next/link";
import useLogout from "../hooks/useLogout";
import checkLogin from "@/Utils/checkLogin";
const { Title } = Typography;
const { Content, Footer } = Layout;

const Home = () => {
  const [role, setRole] = useState("");
  const { logOut, loading } = useLogout();

  useEffect(() => {
    setRole(localStorage.getItem("role"));
    const loggedIn = localStorage.getItem("logged_in");
    if (loggedIn !== "true") {
      checkLogin();
      return;
    }
  }, []);
  return (
    <Layout
      style={{
        minHeight: "100vh",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Content style={{ textAlign: "center" }}>
        <Title>HOME</Title>

        <LinkSection href="/leads" buttonText="Go to leads list" />

        <LinkSection href="/clients" buttonText="Go to  clients list" />

        {role === "admin" && (
          <LinkSection href="/users" buttonText="Go to users list" />
        )}
        <LinkSection href="/profile" buttonText="Profile" />
        <Button loading={loading} onClick={logOut} type="primary">
          {loading ? "Logging out..." : "Log out"}
        </Button>
      </Content>
      <Footer style={{ textAlign: "center" }}>Your Footer Here</Footer>
    </Layout>
  );
};

const LinkSection = ({ href, buttonText }) => (
  <p>
    <Link href={href}>
      <Button type="primary" style={{ margin: "10px" }}>
        {buttonText}
      </Button>
    </Link>
  </p>
);

export default Home;
