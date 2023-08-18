import { useState, useEffect } from "react";

import Link from "next/link";

import { Layout, Button, Typography, Spin } from "antd";
const { Content } = Layout;
const { Title, Text } = Typography;

import api from "../../api/api";
import checkLogin from "@/Utils/checkLogin";
import format from "date-fns/format";
import authErr from "@/api/authErr";

import useLogout from "../../hooks/useLogout";

import AppHeader from "@/components/header";
import AppSider from "@/components/sider";

export default function User() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("");
  const { logOut } = useLogout();

  useEffect(() => {
    const id = localStorage.getItem("currID");
    const loggedIn = localStorage.getItem("logged_in");
    if (loggedIn !== "true") {
      checkLogin();
      return;
    }
    setRole(localStorage.getItem("role"));

    api
      .get(`/users/${id}`)
      .then((response) => {
        setUser(response.data);
      })
      .catch((err) => {
        console.error(err);
        authErr(err, logOut);
      });
  }, []);

  if (user === null) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <>
      <Layout style={{ minHeight: "100vh" }}>
        <AppHeader />
        <Layout style={{ marginLeft: 200, marginTop: 64, minHeight: "100vh" }}>
          <AppSider role={role} />
          <Content
            style={{
              margin: "24px 16px 0",
              display: "flex",
              flexDirection: "column",
              alignItems: "start",
            }}
          >
            <Title>Profile</Title>
            <Text>Name: {user.name}</Text>
            <Text>Email: {user.email}</Text>
            <Text>Role: {user.role}</Text>
            <Text>Phone: {user.phone}</Text>
            <Text>Status: {user.status ? "Active" : "Inactive"}</Text>
            <Text>
              Created At: {format(new Date(user.createdDate), "dd/MM/yyyy")}
            </Text>
            <Text>
              <Link href="/profile/updateinfo">
                <Button style={{ margin: "10px" }}>
                  Update your information
                </Button>
              </Link>
            </Text>
            <Text>
              <Link href="/profile/updatepw">
                <Button style={{ margin: "10px" }}>Update your password</Button>
              </Link>
            </Text>
          </Content>
        </Layout>
      </Layout>
    </>
  );
}
