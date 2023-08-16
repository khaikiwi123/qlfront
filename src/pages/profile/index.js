import { useState, useEffect } from "react";
import api from "../../api/api";
import Link from "next/link";
import checkLogin from "@/Utils/checkLogin";
import useLogout from "../../hooks/useLogout";
import { Layout, Button, Typography, Spin, Popconfirm } from "antd";
import AppHeader from "@/components/header";
import AppSider from "@/components/sider";
import format from "date-fns/format";
import AppCrumbs from "@/components/breadcrumbs";

const { Content } = Layout;
const { Title, Text } = Typography;

export default function User() {
  const [user, setUser] = useState(null);
  const [hasError, setHasError] = useState(false);
  const [role, setRole] = useState("");
  const { logOut, loading } = useLogout();

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
        setHasError(true);
      });
  }, []);

  if (hasError) {
    return (
      <div>
        <Title>SESSION EXPIRED</Title>
        <Text>Please log back in</Text>
        <Button disabled={loading} onClick={logOut} loading={loading}>
          Log out
        </Button>
      </div>
    );
  }

  if (user === null) {
    return <Spin size="large" />;
  }

  return (
    <>
      {" "}
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
            <AppCrumbs paths={[{ name: "Profile" }]} />
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
