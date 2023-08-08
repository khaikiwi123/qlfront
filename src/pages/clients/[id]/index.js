import { useState, useEffect } from "react";
import { Layout, Button, Typography, Spin, Popconfirm } from "antd";
import api from "@/api/api";
import Link from "next/link";
import { useRouter } from "next/router";
import { message, Select } from "antd";
import AppHeader from "@/components/header";
import AppSider from "@/components/sider";
import { EditOutlined } from "@ant-design/icons";
import { format } from "date-fns";
import checkLogin from "@/Utils/checkLogin";
const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

export default function Lead() {
  const [lead, setLead] = useState(null);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [role, setRole] = useState("");
  const [editMode, setEditMode] = useState(false);

  const router = useRouter();
  const id = router.query.id;

  useEffect(() => {
    if (!router.isReady) return;
    const loggedIn = localStorage.getItem("logged_in");
    if (loggedIn !== "true") {
      checkLogin();
      return;
    }
    setRole(localStorage.getItem("role"));
    api
      .get(`/leads/${id}`)
      .then((response) => {
        setLead(response.data);
      })
      .catch((err) => {
        console.error(err);

        const inchargeEmail = err.response?.data?.incharge;

        if (err.response?.data?.error === "Not authorized") {
          message.error(
            `You are not authorized to view this lead. ${
              inchargeEmail
                ? `${inchargeEmail} is in charge of this lead.`
                : "(It belonged to another salesperson)"
            }`
          );

          router.push("/clients/potential");
        }
      });
  }, [id, router]);

  const onDelete = async (id) => {
    setLoadingDelete(true);
    await api.delete(`/leads/${id}`);

    if (role === "admin") {
      router.push("/clients/contact");
    } else {
      router.push("/clients/potential");
    }

    setLoadingDelete(false);
  };

  const onUpdateStatus = async (newStatus) => {
    setLoadingStatus(true);
    try {
      await api.put(`/leads/${id}`, { status: newStatus });
      setLead({ ...lead, status: newStatus });
    } catch (error) {
      console.error(error);
    }
    setLoadingStatus(false);
  };

  if (lead === null) {
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
                  <Button>Update lead&apos;s information</Button>
                </Link>
                <Popconfirm
                  title="Are you sure to delete this lead?"
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
            <Text>Email: {lead.email}</Text>
            <br />
            <Text>Phone: {lead.phone}</Text>
            <br />
            <Text>Organization: {lead.org}</Text>
            <br />
            <Text>Representer: {lead.rep}</Text>
            <br />
            <Text>Status:</Text>
            <Select
              value={lead.status}
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
              Created At: {format(new Date(lead.createdDate), "dd/MM/yyyy")}
            </Text>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
