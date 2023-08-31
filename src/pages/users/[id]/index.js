import { useState, useEffect } from "react";
import api from "../../../api/api";
import { useRouter } from "next/router";
import {
  Layout,
  Button,
  Typography,
  Spin,
  Descriptions,
  Modal,
  Row,
  Col,
  message,
} from "antd";
import { EditOutlined } from "@ant-design/icons";
import AppHeader from "@/components/header";
import AppSider from "@/components/sider";
import checkLogin from "@/Utils/checkLogin";
import AppCrumbs from "@/components/breadcrumbs";
import authErr from "@/api/authErr";
import useLogout from "@/hooks/useLogout";
import dayjs from "dayjs";
import UserUpForm from "@/components/userUp";

const { Content } = Layout;
const { Title } = Typography;

export default function User() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("");
  const [showModal, setModal] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [delModal, setDelModal] = useState(false);
  const [updateOk, setOk] = useState(false);
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
  }, [id, router, updateOk]);

  const onDelete = async (id) => {
    setLoadingDelete(true);
    try {
      await api.delete(`/users/${id}`);
      setDelModal(false);
      message.success("User deleted");
      router.push("/users");
    } catch (error) {
      console.error("Failed to delete user:", error);
      message.error("Error deleting user");
    } finally {
      setLoadingDelete(false);
    }
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
  const items = [
    {
      key: "1",
      label: "Name",
      children: user.name,
    },
    {
      key: "2",
      label: "Email",
      children: user.email,
    },
    {
      key: "3",
      label: "Role",
      children: user.role === "admin" ? "Admin" : "N.V Sale",
    },
    {
      key: "4",
      label: "Phone Number",
      children: user.phone,
    },
    {
      key: "5",
      label: "Created Date",
      children: dayjs(user.createdDate).format("DD/MM/YYYY"),
    },
    {
      key: "6",
      label: "Status",
      children: user.status ? "Active" : "Inactive",
    },
  ];

  return (
    <>
      <Layout style={{ minHeight: "100vh" }}>
        <AppHeader />
        <Layout className="layoutC">
          <AppSider role={role} />
          <Content style={{ margin: "64px 16px 0" }}>
            <AppCrumbs
              paths={[{ name: "Users", href: "/users" }, { name: "Profile" }]}
            />
            <div
              style={{
                minHeight: 280,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginTop: -70,
              }}
            >
              <div
                style={{
                  marginTop: 80,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  borderBottom: "1px solid #A9A9A9",
                  borderTop: "1px solid #A9A9A9",
                }}
              >
                <Title style={{ marginTop: -5 }}>
                  Profile
                  <EditOutlined
                    onClick={() => setModal(true)}
                    style={{ marginLeft: "10px", fontSize: "16px" }}
                  />
                  <UserUpForm
                    visible={showModal}
                    onClose={() => setModal(false)}
                    onSuccess={() => setOk(true)}
                    userId={id}
                  />
                </Title>
                <Descriptions
                  size="small"
                  layout="vertical"
                  items={items}
                  className="Desc"
                />
              </div>
            </div>
            <div
              style={{
                minHeight: 280,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginTop: -70,
              }}
            >
              <Button key="delete" danger onClick={() => setDelModal(true)}>
                Delete this user
              </Button>
              <Modal
                title="Delete"
                visible={delModal}
                onCancel={() => {
                  setDelModal(false);
                }}
                footer={[
                  <Row key="footerRow" style={{ width: "100%" }}>
                    <Col span={2}>
                      <Button
                        key="no"
                        onClick={() => {
                          setDelModal(false);
                        }}
                        loading={loadingDelete}
                      >
                        No
                      </Button>
                    </Col>
                    <Col span={22} style={{ textAlign: "right" }}>
                      <Button
                        key="complete"
                        type="primary"
                        onClick={() => onDelete(id)}
                        danger
                        loading={loadingDelete}
                      >
                        Yes
                      </Button>
                    </Col>
                  </Row>,
                ]}
              >
                <p>Are you sure you want to delete this?</p>
              </Modal>
            </div>
          </Content>
        </Layout>
      </Layout>
    </>
  );
}
