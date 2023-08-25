import { useState, useEffect } from "react";
import api from "../../../api/api";
import Link from "next/link";
import { useRouter } from "next/router";
import { Layout, Button, Typography, Spin, Popconfirm } from "antd";
import AppHeader from "@/components/header";
import AppSider from "@/components/sider";
import checkLogin from "@/Utils/checkLogin";
import AppCrumbs from "@/components/breadcrumbs";
import authErr from "@/api/authErr";
import useLogout from "@/hooks/useLogout";
import dayjs from "dayjs";

const { Content } = Layout;
const { Title, Text } = Typography;

export default function User() {
  const [user, setUser] = useState(null);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [currID, setCurrID] = useState("");

  const { logOut } = useLogout();
  const router = useRouter();
  const id = router.query.id;

  useEffect(() => {
    const loggedIn = localStorage.getItem("logged_in");
    if (loggedIn !== "true") {
      checkLogin();
      return;
    }
    if (!router.isReady) return;
    setCurrID(localStorage.getItem("currID"));
    api
      .get(`/users/${id}`)
      .then((response) => {
        setUser(response.data);
      })
      .catch((err) => {
        console.error(err);
        authErr(err, logOut);
      });
  }, [id, router]);

  const onDelete = async (id) => {
    setLoadingDelete(true);
    await api.delete(`/users/${id}`);
    router.push("/users/");
    setLoadingDelete(false);
  };

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
        <Layout style={{ marginLeft: 200, minHeight: "100vh" }}>
          <AppSider role={user.role} />
          <Content
            style={{
              margin: "24px 16px 0",
              display: "flex",
              flexDirection: "column",
              alignItems: "start",
            }}
          >
            <AppCrumbs
              paths={[{ name: "Users", href: "/users" }, { name: "Profile" }]}
            />
            <Title>Profile</Title>
            <Text>Name: {user.name}</Text>
            <Text>Email: {user.email}</Text>
            <Text>Role: {user.role}</Text>
            <Text>Phone: {user.phone}</Text>
            <Text>
              Created At: {dayjs(user.createdDate).format("DD/MM/YYYY")}
            </Text>
            <Text>Status: {user.status ? "Active" : "Inactive"}</Text>
            <Text>
              <Link href={`/users/${id}/updateinfo`}>
                <Button style={{ margin: "10px" }}>
                  Update user&apos;s information
                </Button>
              </Link>
              <Link href={`/users/${id}/updatepw`}>
                <Button style={{ margin: "10px" }}>
                  Update user&apos;s password
                </Button>
              </Link>
              {id !== currID && (
                <Popconfirm
                  title="Are you sure to delete this user?"
                  onConfirm={() => onDelete(id)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button
                    danger
                    style={{ margin: "10px" }}
                    loading={loadingDelete}
                  >
                    Delete
                  </Button>
                </Popconfirm>
              )}
            </Text>
            <Link href="/users">
              <Button style={{ margin: "10px" }}>Back to users list</Button>
            </Link>
          </Content>
        </Layout>
      </Layout>
    </>
  );
}
