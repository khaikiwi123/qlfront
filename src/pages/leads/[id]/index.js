import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import dayjs from "dayjs";

import {
  Layout,
  Spin,
  message,
  Descriptions,
  Button,
  Modal,
  Row,
  Col,
} from "antd";
const { Content } = Layout;
import api from "@/api/api";
import checkLogin from "@/Utils/checkLogin";
import authErr from "@/api/authErr";

import useLogout from "@/hooks/useLogout";

import AppHeader from "@/components/header";
import AppSider from "@/components/sider";
import AppCrumbs from "@/components/breadcrumbs";
import UpdateForm from "@/components/updateForm";
import AppStep from "@/components/step";
import AppHistory from "@/components/history";

export default function Lead() {
  const router = useRouter();
  const id = router.query.id;

  const [lead, setLead] = useState(null);
  const [role, setRole] = useState("");
  const [changeLog, setChangeLogs] = useState([]);
  const [showUpModal, setShowModal] = useState(false);
  const [delModal, setDelModal] = useState(false);
  const [delLoading, setDelLoading] = useState(false);
  const [updateOk, setOk] = useState(false);
  const [products, setProducts] = useState([]);
  const [currUser, setCurrUser] = useState("");

  const { logOut } = useLogout();
  const fetchChangeLogs = async () => {
    try {
      const response = await api.get(`/leads/${id}/log`);
      setChangeLogs(response.data.changelog);
    } catch (error) {
      console.error("Failed to fetch change logs:", error);
    }
  };
  const fetchProducts = async () => {
    try {
      const response = await api.get("products");
      if (response.data && response.data.products) {
        setProducts(response.data.products);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  const onDelete = async (id) => {
    setDelLoading(true);
    try {
      await api.delete(`/leads/${id}`);
      setDelModal(false);
      message.success("Lead xóa thành công");
      router.push("/leads");
    } catch (error) {
      console.error("Failed to delete lead:", error);
      message.error("Lỗi xóa lead");
    } finally {
      setDelLoading(false);
    }
  };
  useEffect(() => {
    if (!router.isReady) return;
    const loggedIn = localStorage.getItem("logged_in");
    if (loggedIn !== "true") {
      checkLogin();
      return;
    }
    setRole(localStorage.getItem("role"));
    setCurrUser(localStorage.getItem("currUser"));
    api
      .get(`/leads/${id}`)
      .then((response) => {
        setLead(response.data);
      })
      .catch((err) => {
        console.error(err);
        authErr(err, logOut);
        if (err.response?.data?.error === "Not authorized") {
          message.error("Bạn không có quyền để xem lead này");

          router.push("/leads");
        }
        if (err.response?.data?.error === "Lead not found") {
          message.error("Lead không tồn tại");

          router.push("/leads");
        }
      }, fetchChangeLogs());
    fetchProducts();
  }, [id, router, updateOk]);

  if (lead === null) {
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
      label: "Email",
      children: lead.email,
    },
    {
      key: "2",
      label: "Số điện thoại",
      children: lead.phone,
    },
    {
      key: "3",
      label: "Người đại diện",
      children: lead.rep,
    },
    {
      key: "4",
      label: "Chịu trách nhiệm",
      children: lead.inCharge,
    },
    {
      key: "5",
      label: "Ngày tạo",
      children: dayjs(lead.createdDate).format("DD/MM/YYYY"),
    },
  ];
  if (lead.product !== "Chưa có sản phẩm") {
    items.push({
      key: "6",
      label: "Sản phẩm",
      children: lead.product,
    });
  }
  const leadTitle = lead.org;

  return (
    <>
      <Layout style={{ minHeight: "100vh" }}>
        <AppHeader />
        <Layout className="layoutC">
          <AppSider role={role} />
          <Content style={{ margin: "64px 16px 0" }}>
            <AppCrumbs paths={[{ name: "Leads", href: "/leads" }]} />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                borderBottom: "1px solid #A9A9A9",
                borderTop: "1px solid #A9A9A9",
              }}
            >
              <Descriptions
                size="small"
                title={
                  <div style={{ whiteSpace: "normal", fontSize: "25px" }}>
                    {leadTitle}
                  </div>
                }
                extra={
                  <Button
                    onClick={() => setShowModal(true)}
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
              <UpdateForm
                visible={showUpModal}
                onClose={() => setShowModal(false)}
                roleId={role}
                userId={id}
                onSuccess={() => setOk((prev) => !prev)}
                uType="leads"
              />
            </div>

            <div>
              <AppStep
                id={id}
                role={role}
                status={lead.status}
                trackStatus={lead.trackStatus}
                email={lead.email}
                phone={lead.phone}
                org={lead.org}
                currUser={currUser}
                setLead={setLead}
                fetchChangeLogs={fetchChangeLogs}
                products={products}
              />
            </div>
            <div
              style={{
                textAlign: "left",
                borderTop: "1px solid #A9A9A9",
              }}
            >
              <h3
                style={{
                  textAlign: "left",
                  marginTop: 15,
                  color: "#00000073",
                }}
              >
                Lịch sử
              </h3>
              <AppHistory id={id} changeLog={changeLog} />
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
                  Xóa lead này
                </Button>
              </Row>

              <Modal
                title="Xóa"
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
                        loading={delLoading}
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
                        loading={delLoading}
                      >
                        Có
                      </Button>
                    </Col>
                  </Row>,
                ]}
              >
                <p>Bạn có chắc là bạn muốn xóa lead này?</p>
              </Modal>
            </div>
          </Content>
        </Layout>
      </Layout>
    </>
  );
}
