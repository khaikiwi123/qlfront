import { useState, useEffect } from "react";
import api from "../../../api/api";
import Link from "next/link";
import { useRouter } from "next/router";
import useLogout from "../../../hooks/useLogout";
import { Layout, Button, Typography, Spin, Popconfirm } from "antd";
import AppHeader from "@/components/header";
import AppSider from "@/components/sider";

const { Content } = Layout;
const { Title, Text } = Typography;

export default function User() {
  const [user, setUser] = useState(null);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [currID, setCurrID] = useState("");
  const { logOut, loading } = useLogout();

  const router = useRouter();
  const id = router.query.id;

  useEffect(() => {
    setCurrID(localStorage.getItem("currID"));

    const loggedin = localStorage.getItem("logged_in");
    if (loggedin !== "true") {
      router.push("/login");
      return;
    }
    api
      .get(`/users/${id}`)
      .then((response) => {
        setUser(response.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [id, router]);

  const onDelete = async (id) => {
    setLoadingDelete(true);
    await api.delete(`/users/${id}`);
    router.push("/users/");
    setLoadingDelete(false);
  };

  if (user === null) {
    return <Spin size="large" />;
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <AppHeader />
      <Layout>
        <AppSider role={user.role} />
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
          <Text>Created At: {new Date(user.createdDate).toLocaleString()}</Text>
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
  );
}
