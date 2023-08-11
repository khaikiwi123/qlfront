import { useState, useEffect } from "react";
import { Layout, Button, Typography, Spin, Modal, Avatar } from "antd";
import api from "@/api/api";
import Link from "next/link";
import { useRouter } from "next/router";
import { message, Select } from "antd";
import AppHeader from "@/components/header";
import AppSider from "@/components/sider";
import { EditOutlined } from "@ant-design/icons";
import { format } from "date-fns";
import checkLogin from "@/Utils/checkLogin";
import AppCrumbs from "@/components/breadcrumbs";
const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

export default function Client() {
  const [client, setClient] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [showModal, setModal] = useState(false);
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

          router.push("/clients/");
        }
      });
  }, [id, router]);

  const onUpdateStatus = async (newStatus) => {
    if (newStatus === "Failed") {
      setModal(true);
      return;
    }
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
  const handleConfirmSuccess = async () => {
    setLoadingStatus(true);
    try {
      await api.put(`/clients/${id}`, { status: "Failed" });
      setClient({ ...client, status: "Failed" });
      router.push("/leads");
    } catch (error) {
      console.error(error);
    }
    setLoadingStatus(false);
  };

  const handleCancelSuccess = () => {
    setModal(false);
  };
  return (
    <>
      <style jsx global>{`
        body,
        html {
          margin: 0;
          padding: 0;
        }
      `}</style>
      <Layout style={{ minHeight: "100vh" }}>
        <AppHeader />
        <Layout style={{ marginLeft: 200, marginTop: 64, minHeight: "100vh" }}>
          <AppSider role={role} />
          <Content style={{ margin: "24px 16px 0" }}>
            <div style={{ padding: 24, minHeight: 360 }}>
              <AppCrumbs
                paths={[
                  { name: "Clients", href: "/clients" },
                  { name: "Profile" },
                ]}
              />
              <Title>
                Profile
                <EditOutlined
                  onClick={() => setEditMode(!editMode)}
                  style={{ marginLeft: "10px", fontSize: "16px" }}
                />
              </Title>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "start",
                }}
              >
                <Avatar
                  size={200}
                  src={client.avatar}
                  style={{ marginRight: "20px" }}
                />{" "}
                <div style={{ flexGrow: 1 }}>
                  {editMode && (
                    <>
                      <Link href={`/clients/${id}/updateinfo`}>
                        <Button>Update client&apos;s information</Button>
                      </Link>
                    </>
                  )}
                  <br />
                  <Text>Email: {client.email}</Text>
                  <br />
                  <Text>Phone: {client.phone}</Text>
                  <br />
                  <Text>Organization: {client.org}</Text>
                  <br />
                  <Text>Representer: {client.rep}</Text>
                  <br />
                  <Text>Status:</Text>
                  <Select
                    value={client.status}
                    onChange={onUpdateStatus}
                    loading={loadingStatus}
                    disabled={loadingStatus}
                    style={{ width: 200 }}
                  >
                    <Option value="Success">Thành công</Option>
                    <Option value="Failed">Thất bại</Option>
                  </Select>
                  <br />
                  <Text>
                    Created At:{" "}
                    {format(new Date(client.createdDate), "dd/MM/yyyy")}
                  </Text>
                </div>
              </div>
            </div>
          </Content>
        </Layout>
      </Layout>
      <Modal
        title="Confirm Status Change"
        visible={showModal}
        onOk={handleConfirmSuccess}
        onCancel={handleCancelSuccess}
      >
        <p>Are you sure you want to set this client's status to "Failed"?</p>
      </Modal>
    </>
  );
}
