import { useState, useEffect } from "react";
import {
  Layout,
  Button,
  Typography,
  Spin,
  Popconfirm,
  Modal,
  Steps,
} from "antd";
import api from "@/api/api";
import Link from "next/link";
import { useRouter } from "next/router";
import { message } from "antd";
import AppHeader from "@/components/header";
import AppSider from "@/components/sider";
import { EditOutlined, UserOutlined } from "@ant-design/icons";
import { format } from "date-fns";
import checkLogin from "@/Utils/checkLogin";
import AppCrumbs from "@/components/breadcrumbs";
const { Content } = Layout;
const { Title, Text } = Typography;
const { Step } = Steps;

export default function Lead() {
  const [lead, setLead] = useState(null);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [showModal, setModal] = useState(false);
  const [role, setRole] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [pendingStatus, setPendingStatus] = useState("");
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

          router.push("/leads");
        }
      });
  }, [id, router]);

  const onDelete = async (id) => {
    setLoadingDelete(true);
    await api.delete(`/leads/${id}`);

    router.push("/leads");

    setLoadingDelete(false);
  };

  const onUpdateStatus = async (newStatus) => {
    if (newStatus === "Success") {
      setModal(true);
      return;
    }
    try {
      await api.put(`/leads/${id}`, { status: newStatus });
      setLead({ ...lead, status: newStatus });
    } catch (error) {
      console.error(error);
    }
  };

  if (lead === null) {
    return <Spin size="large" />;
  }
  const onChangeStatusStep = (currentIndex) => {
    const statusKeys = Object.keys(statusToIndex);
    const newStatus = statusKeys[currentIndex];
    setPendingStatus(newStatus);
    setModal(true);
  };
  const handleConfirmChange = async () => {
    try {
      if (pendingStatus === "Success") {
        await api.put(`/leads/${id}`, { status: "Success" });
        setLead({ ...lead, status: "Success" });
        router.push(`/clients?email=${lead.email}`);
      } else {
        await onUpdateStatus(pendingStatus);
      }
      setPendingStatus("");
    } catch (error) {
      console.error(error);
    }
    setModal(false);
  };

  const statusToIndex = {
    "No contact": 0,
    "In contact": 1,
    "Verified needs": 2,
    Consulted: 3,
    Success: 4,
  };
  const shouldAllowStepChange = () => lead.status !== "Success";

  return (
    <>
      <style jsx global>{`
        body,
        html {
          margin: 0;
          padding: 0;
        }

        .avatar-container {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .info-container {
          flex: 2;
        }
        .custom-steps.ant-steps.ant-steps-navigation .ant-steps-item::after {
          display: inline-block;
          width: 15px;
          height: 15px;
          border-top: 2px solid #001d66;
          border-bottom: none;
          border-inline-start: none;
          border-inline-end: 2px solid #001d66;
          transform: translateY(-50%) translateX(-50%) rotate(45deg);
        }
      `}</style>
      <Layout style={{ minHeight: "100vh" }}>
        <AppHeader />
        <Layout style={{ marginLeft: 200, marginTop: 64, minHeight: "100vh" }}>
          <AppSider role={role} />
          <Content style={{ margin: "24px 16px 0" }}>
            <div style={{ padding: 24, minHeight: 360, display: "flex" }}>
              <AppCrumbs
                paths={[{ name: "Leads", href: "/leads" }, { name: "Profile" }]}
              />

              <div className="avatar-container">
                <UserOutlined style={{ fontSize: "80px", color: "#bfbfbf" }} />
              </div>

              <div className="info-container">
                <Title>
                  Profile
                  <EditOutlined
                    onClick={() => setEditMode(!editMode)}
                    style={{ marginLeft: "10px", fontSize: "16px" }}
                  />
                </Title>
                {editMode && (
                  <>
                    <Link href={`/leads/${id}/updateinfo`}>
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

                <Text>
                  Created At: {format(new Date(lead.createdDate), "dd/MM/yyyy")}
                </Text>
              </div>
            </div>

            <div>
              <Steps
                type="navigation"
                size="small"
                current={statusToIndex[lead.status]}
                onChange={shouldAllowStepChange() ? onChangeStatusStep : null}
                className="custom-steps"
              >
                <Step title="Chưa liên hệ" />
                <Step title="Đã liên hệ" />
                <Step title="Đã xác định nhu cầu" />
                <Step title="Đã tư vấn" />
                <Step title="Thành công" />
              </Steps>
            </div>
          </Content>
        </Layout>
      </Layout>
      <Modal
        title="Confirm Status Change"
        visible={showModal}
        onOk={handleConfirmChange}
        onCancel={() => {
          setPendingStatus("");
          setModal(false);
        }}
      >
        <p>
          Are you sure you want to set this lead's status to "{pendingStatus}"?
        </p>
      </Modal>
    </>
  );
}
