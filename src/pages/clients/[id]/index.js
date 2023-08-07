import { useState, useEffect } from "react";
import { Layout, Button, Typography, Spin, Popconfirm } from "antd";
import api from "@/api/api";
import Link from "next/link";
import { useRouter } from "next/router";
import { message, Select } from "antd";
import useCheckLogin from "@/hooks/useCheckLogin";
import AppHeader from "@/components/header";
import AppSider from "@/components/sider";
import { EditOutlined } from "@ant-design/icons";
import { format } from "date-fns";

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

export default function Client() {
  const [client, setClient] = useState(null);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [role, setRole] = useState("");
  const [editMode, setEditMode] = useState(false);

  const router = useRouter();
  const id = router.query.id;
  useCheckLogin();

  useEffect(() => {
    if (!router.isReady) return;

    setRole(localStorage.getItem("role"));
    api
      .get(`/clients/${id}`)
      .then((response) => {
        setClient(response.data);
      })
      .catch((err) => {
        console.error(err);

        const inchargeEmail = err.response?.data?.incharge;

        if (err.response?.data?.error === "Not authorized") {
          message.error(
            `You are not authorized to view this client. ${
              inchargeEmail
                ? `${inchargeEmail} is in charge of this client.`
                : "(It belonged to another salesperson)"
            }`
          );

          router.push("/clients/potential");
        }
      });
  }, [id, router]);

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

  const onUpdateStatus = async (newStatus) => {
    setLoadingStatus(true);
    try {
      await api.put(`/clients/${id}`, { status: newStatus });
      setClient({ ...client, status: newStatus });
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
      <Layout style={{ marginLeft: 200, marginTop: 64, minHeight: "100vh" }}>
        <AppSider role={role} />
        <Content style={{ margin: "24px 16px 0" }}>
          <div style={{ padding: 24, minHeight: 360 }}>
            <Title>
              Profile
              <EditOutlined
                onClick={() => setEditMode(!editMode)}
                style={{ marginLeft: "10px", fontSize: "16px" }}
              />
            </Title>
            {editMode && (
              <>
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
              </>
            )}
            <br />
            <Text>Email: {client.email}</Text>
            <br />
            <Text>Phone: {client.phone}</Text>
            <br />
            <Text>Organization: {client.org}</Text>
            <br />
            <Text>Representer: {client.represent}</Text>
            <br />
            <Text>Status:</Text>
            <Select
              value={client.status}
              onChange={onUpdateStatus}
              loading={loadingStatus}
              disabled={loadingStatus}
              style={{ width: 200 }}
            >
              <Option value="No contact">Chưa liên hệ</Option>
              <Option value="In contact">Đã liên hệ</Option>
              <Option value="Verified needs">Đã xác định nhu cầu</Option>
              <Option value="Consulted">Đã tư vấn</Option>
              <Option value="Acquired">Thành công</Option>
            </Select>
            <br />
            <Text>
              Created At: {format(new Date(client.createdDate), "dd/MM/yyyy")}
            </Text>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
