import { useState, useEffect } from "react";
import api from "../../../api/api";
import { useRouter } from "next/router";
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
import AppCrumbs from "@/components/breadcrumbs";
import authErr from "@/api/authErr";
import useLogout from "@/hooks/useLogout";
import dayjs from "dayjs";
import UserUpForm from "@/components/userUp";

const { Content } = Layout;

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
        if (err.response?.data?.error === "User doesn't exist") {
          message.error("Người dùng không tồn tại");

          router.push("/users");
        }
      });
  }, [id, router, updateOk]);

  const onDelete = async (id) => {
    setLoadingDelete(true);
    try {
      await api.delete(`/users/${id}`);
      setDelModal(false);
      message.success("Người dùng đã xóa thành công");
      router.push("/users");
    } catch (error) {
      console.error("Failed to delete user:", error);
      message.error("Có lỗi xóa người dùng");
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
      children: user.status ? "Đang hoạt động" : "Đã bị khóa",
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
              paths={[{ name: "Danh sách người dùng", href: "/users" }]}
            />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                borderBottom: "1px solid #A9A9A9",
                borderTop: "1px solid #A9A9A9",
              }}
            >
              <UserUpForm
                visible={showModal}
                onClose={() => setModal(false)}
                onSuccess={() => setOk((prev) => !prev)}
                userId={id}
                user={user}
              />
              <Descriptions
                size="small"
                title={
                  <div style={{ whiteSpace: "normal", fontSize: "25px" }}>
                    Thông tin chi tiết
                  </div>
                }
                extra={
                  <Button
                    onClick={() => setModal(true)}
                    type="primary"
                    ghost
                    style={{
                      marginLeft: "10px",
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
            <div>
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
                  Xóa người dùng này
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
                        onClick={() => onDelete(id)}
                        danger
                        loading={loadingDelete}
                      >
                        Có
                      </Button>
                    </Col>
                  </Row>,
                ]}
              >
                <p>Bạn có chắc là bạn muốn xóa người dùng này?</p>
              </Modal>
            </div>
          </Content>
        </Layout>
      </Layout>
    </>
  );
}
