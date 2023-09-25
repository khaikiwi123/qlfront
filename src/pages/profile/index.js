import { useState, useEffect } from "react";
import api from "../../api/api";
import {
  Layout,
  Button,
  Spin,
  Descriptions,
  Modal,
  Row,
  Col,
  message,
} from "antd";
import AppHeader from "@/components/header";
import AppSider from "@/components/sider";
import checkLogin from "@/Utils/checkLogin";
import authErr from "@/api/authErr";
import useLogout from "@/hooks/useLogout";
import dayjs from "dayjs";
import ProfileUpForm from "@/components/profileUp";

const { Content } = Layout;

export default function User() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("");
  const [showModal, setModal] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [delModal, setDelModal] = useState(false);
  const [updateOk, setOk] = useState(false);
  const [currId, setId] = useState(false);
  const { logOut } = useLogout();

  useEffect(() => {
    const id = localStorage.getItem("currID");
    setId(id);
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
  }, [updateOk]);
  const onDelete = async (currId) => {
    setLoadingDelete(true);
    try {
      await api.delete(`/users/${currId}`);
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
  const items = user
    ? [
        {
          key: "1",
          label: "Tên",
          children: user.name,
        },
        {
          key: "2",
          label: "Email",
          children: user.email,
        },
        {
          key: "3",
          label: "Vai trò",
          children: user.role === "admin" ? "Admin" : "N.V Sale",
        },
        {
          key: "4",
          label: "Số điện thoại",
          children: user.phone,
        },
        {
          key: "5",
          label: "Ngày tạo",
          children: dayjs(user.createdDate).format("DD/MM/YYYY"),
        },
        {
          key: "6",
          label: "Trạng thái",
          children: user.status ? "Active" : "Inactive",
        },
      ]
    : [];

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
        <Layout className="layoutC">
          <AppSider role={role} />
          <Content style={{ margin: "64px 16px 0" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                borderBottom: "1px solid #A9A9A9",
                borderTop: "1px solid #A9A9A9",
              }}
            >
              <ProfileUpForm
                visible={showModal}
                onClose={() => setModal(false)}
                onSuccess={() => setOk(true)}
                userId={currId}
              />
              <Descriptions
                size="small"
                title={
                  <div style={{ whiteSpace: "normal", fontSize: "25px" }}>
                    Thông tin cá nhân
                  </div>
                }
                extra={
                  <Button
                    onClick={() => setModal(true)}
                    type="primary"
                    ghost
                    style={{
                      marginLeft: "10px",
                      fontSize: "16px",
                      minWidth: "100px",
                      marginTop: "20px",
                      marginBottom: "10px",
                    }}
                  >
                    Cập nhập
                  </Button>
                }
                layout="vertical"
                labelStyle={{}}
                contentStyle={{
                  fontWeight: "400",
                  color: "black",
                  marginTop: -15,
                }}
                items={items}
                className="Desc"
                colon={false}
              />
            </div>
            {/* <div>
              <Row
                type="flex"
                justify="center"
                style={{ width: "100%", marginBottom: 40 }}
              >
                <Button
                  danger
                  style={{ marginTop: 15 }}
                  onClick={() => setDelModal(true)}
                >
                  Xóa tài khoản
                </Button>
              </Row>
              <Modal
                title="Delete"
                visible={delModal}
                centered
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
                        Không
                      </Button>
                    </Col>
                    <Col span={22} style={{ textAlign: "right" }}>
                      <Button
                        key="complete"
                        type="primary"
                        onClick={() => onDelete(currId)}
                        danger
                        loading={loadingDelete}
                      >
                        Có
                      </Button>
                    </Col>
                  </Row>,
                ]}
              >
                <p>Bạn có chắc là bạn muốn xóa tài khoản không?</p>
              </Modal>
            </div> */}
          </Content>
        </Layout>
      </Layout>
    </>
  );
}
