import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import dayjs from "dayjs";

import {
  Layout,
  Button,
  Typography,
  Spin,
  Popconfirm,
  Modal,
  Steps,
  message,
  Timeline,
} from "antd";
import { EditOutlined, UserOutlined } from "@ant-design/icons";
const { Content } = Layout;
const { Title, Text } = Typography;
const { Step } = Steps;

import api from "@/api/api";
import checkLogin from "@/Utils/checkLogin";
import { translateStatus } from "@/Utils/translate";
import authErr from "@/api/authErr";

import useLogout from "@/hooks/useLogout";

import AppHeader from "@/components/header";
import AppSider from "@/components/sider";
import AppCrumbs from "@/components/breadcrumbs";

export default function Lead() {
  const router = useRouter();
  const id = router.query.id;

  const [lead, setLead] = useState(null);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [showModal, setModal] = useState(false);
  const [role, setRole] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [pendingStatus, setPendingStatus] = useState("");
  const [changeLog, setChangeLogs] = useState([]);
  const [isModalLoading, setIsModalLoading] = useState(false);

  const { logOut } = useLogout();

  const fetchChangeLogs = async () => {
    try {
      const response = await api.get(`/leads/${id}/log`);
      setChangeLogs(response.data.changelog);
    } catch (error) {
      console.error("Failed to fetch change logs:", error);
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
    api
      .get(`/leads/${id}`)
      .then((response) => {
        setLead(response.data);
      })
      .catch((err) => {
        console.error(err);
        authErr(err, logOut);
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
      }, fetchChangeLogs());
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
  const onChangeStatusStep = (currentIndex) => {
    const statusKeys = Object.keys(statusToIndex);
    const newStatus = statusKeys[currentIndex];
    setPendingStatus(newStatus);
    setModal(true);
  };
  const handleConfirmChange = async () => {
    setIsModalLoading(true);
    try {
      if (pendingStatus === "Success") {
        await api.put(`/leads/${id}`, { status: "Success" });
        setLead({ ...lead, status: "Success" });
        router.push(`/clients?email=${lead.email}`);
      } else {
        await onUpdateStatus(pendingStatus);
      }
      setPendingStatus("");
      fetchChangeLogs();
    } catch (error) {
      console.error(error);
    }
    setIsModalLoading(false);
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
      <Layout style={{ minHeight: "100vh" }}>
        <AppHeader />
        <Layout style={{ marginLeft: 200, marginTop: 64, minHeight: "100vh" }}>
          <AppSider role={role} />
          <Content style={{ margin: "0 16px 0" }}>
            <div style={{ minHeight: 360, display: "flex" }}>
              <AppCrumbs
                paths={[{ name: "Leads", href: "/leads" }, { name: "Profile" }]}
              />

              <div style={{ marginLeft: "400px" }}>
                <Title>
                  {lead.org}
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

                <Text>Representative: {lead.rep}</Text>
                <br />

                <Text>
                  Created At: {dayjs(lead.createdDate).format("DD/MM/YYYY")}
                </Text>
              </div>
            </div>

            <div className="steps-container">
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
            <h3 style={{ textAlign: "left" }}>History</h3>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                maxHeight: "200px",
                overflowY: "auto",
                border: "1px solid #d9d9d9",
                borderRadius: "4px",
                padding: "8px",
              }}
            >
              {changeLog.length > 0 ? (
                <Timeline
                  style={{ textAlign: "left", marginTop: 0 }}
                  mode="left"
                  reverse="true"
                >
                  {changeLog.map((log, index) => (
                    <Timeline.Item
                      label={
                        <span
                          style={
                            index !== changeLog.length - 1
                              ? { color: "gray" }
                              : {}
                          }
                        >
                          {dayjs(log.updatedAt).format("DD/MM/YYYY HH:mm")}
                        </span>
                      }
                      color={index !== changeLog.length - 1 ? "gray" : "green"}
                    >
                      <span
                        style={
                          index !== changeLog.length - 1
                            ? { color: "gray" }
                            : {}
                        }
                      >
                        {log.changedBy} đã thay đổi trạng thái từ{" "}
                        {translateStatus(log.oldValue)} sang{" "}
                        {translateStatus(log.newValue)} sau{" "}
                        {log.daysLastUp ? log.daysLastUp : "?"} ngày
                      </span>
                    </Timeline.Item>
                  ))}
                </Timeline>
              ) : (
                <p>History is empty</p>
              )}
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
        confirmLoading={isModalLoading}
      >
        <p>
          Are you sure you want to set this lead's status to "
          {translateStatus(pendingStatus)}"?
        </p>
      </Modal>
    </>
  );
}
