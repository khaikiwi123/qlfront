import { useState, useEffect } from "react";
import { Layout, Button, Typography, Spin, Popconfirm } from "antd";
import api from "@/api/api";
import Link from "next/link";
import { useRouter } from "next/router";
import useLogout from "@/hooks/useLogout";
import useCheckLogin from "@/hooks/useCheckLogin";
import AppHeader from "@/components/header";
import AppSider from "@/components/sider";

const { Content } = Layout;
const { Title, Text } = Typography;

export default function Client() {
  const [client, setClient] = useState(null);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [role, setRole] = useState("");

  const router = useRouter();
  const id = router.query.id;
  useCheckLogin();

  useEffect(() => {
    setRole(localStorage.getItem("role"));
    api
      .get(`/clients/${id}`)
      .then((response) => {
        setClient(response.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [id]);

  const onDelete = async (id) => {
    setLoadingDelete(true);
    await api.delete(`/clients/${id}`);

    if (role === "admin") {
      router.push("/clients/all");
    } else {
      router.push("/clients/potential");
    }

    setLoadingDelete(false);
  };

  const onUpdate = async (id) => {
    setLoadingStatus(true);

    try {
      const currentStatus = client.status;
      await api.put(`/clients/${id}`, { status: !currentStatus });
      setClient({ ...client, status: !currentStatus });
    } catch (error) {
      console.error(error);
    }

    setLoadingStatus(false);
  };

  if (client === null) {
    return <Spin size="large" />;
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <AppHeader />
      <Layout>
        <AppSider role={role} />
        <Content style={{ margin: "24px 16px 0" }}>
          <div style={{ padding: 24, minHeight: 360 }}>
            <Title>Profile</Title>
            <Text>Email: {client.email}</Text>
            <br />
            <Text>Phone: {client.phone}</Text>
            <br />
            <Text>Unit: {client.unit}</Text>
            <br />
            <Text>Representer: {client.represent}</Text>
            <br />
            <Text>Status:</Text>
            <Button onClick={() => onUpdate(id)} loading={loadingStatus}>
              {client.status ? "Đã kí kết" : "Đang chăm sóc"}
            </Button>
            <br />
            <Text>
              Created At: {new Date(client.createdDate).toLocaleString()}
            </Text>
            <br />
            <Link href={`/clients/${id}/updateinfo`}>
              <Button>Update client&apos;s information</Button>
            </Link>
            <Popconfirm
              title="Are you sure to delete this client?"
              onConfirm={() => onDelete(id)}
              okText="Yes"
              cancelText="No"
            >
              <Button danger loading={loadingDelete}>
                {loadingDelete ? "Deleting..." : "Delete"}
              </Button>
            </Popconfirm>
            <br />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
