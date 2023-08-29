import { useState, useEffect } from "react";
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
import {
  EditOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
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
import UpdateForm from "@/components/updateForm";

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
  const [showUpModal, setShowModal] = useState(false);
  const [updateOk, setOk] = useState(false);

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
        if (err.response?.data?.error === "Lead not found") {
          message.error("Lead doesn't exist");

          router.push("/leads");
        }
      }, fetchChangeLogs());
  }, [id, router, updateOk]);

  const onDelete = async (id) => {
    setLoadingDelete(true);
    await api.delete(`/leads/${id}`);

    router.push("/leads");

    setLoadingDelete(false);
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

  const statusToIndex = {
    "No contact": 0,
    "In contact": 1,
    "Verified needs": 2,
    Consulted: 3,
    Success: 4,
  };
  const onChangeStatusStep = (currentIndex) => {
    const statusKeys = Object.keys(statusToIndex);
    const newStatus = statusKeys[currentIndex];
    setPendingStatus(newStatus);
    setModal(true);
  };
  const handleConfirmChange = async (statusType) => {
    setIsModalLoading(true);
    try {
      let updateStatus;
      if (statusType === "Failed") {
        updateStatus = { status: "Failed", trackStatus: pendingStatus };
      } else {
        updateStatus = { status: pendingStatus, trackStatus: pendingStatus };
      }

      await api.put(`/leads/${id}`, updateStatus);
      setLead((prevState) => ({
        ...prevState,
        ...updateStatus,
      }));

      if (updateStatus.status === "Success") {
        router.push(`/clients?email=${lead.email}`);
      }
      fetchChangeLogs();
    } catch (error) {
      console.error(error);
    }

    setIsModalLoading(false);
    setModal(false);
  };
  const renderStepDescription = (currentIndex) => {
    if (currentStep === currentIndex) {
      if (lead.status === "Failed") {
        return (
          <span
            onClick={() => onChangeStatusStep(currentIndex)}
            style={{ cursor: "pointer", color: "red" }}
          >
            Action
          </span>
        );
      } else {
        return (
          <span
            onClick={() => onChangeStatusStep(currentIndex)}
            style={{ cursor: "pointer", color: "#1890ff" }}
          >
            Action
          </span>
        );
      }
    } else if (currentStep > currentIndex) {
      return <>Completed</>;
    }
    return null;
  };

  const currentStep = statusToIndex[lead.trackStatus] || 0;
  const shouldAllowStepChange = (currentIndex) => {
    // if (currentIndex < currentStep) {
    //   return false;
    // }
    return lead.status !== "Success" && lead.status !== "Failed";
  };
  const determineStepIcon = (currentIndex) => {
    if (currentStep === currentIndex && lead.status === "Failed") {
      return <CloseCircleOutlined style={{ color: "red" }} />;
    }
    return null;
  };

  return (
    <>
      <Layout style={{ minHeight: "100vh" }}>
        <AppHeader />
        <Layout className="layoutC">
          <AppSider role={role} />
          <Content style={{ margin: "64px 16px 0" }}>
            <AppCrumbs
              paths={[{ name: "Leads", href: "/leads" }, { name: "Profile" }]}
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
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                }}
              >
                <Title>
                  {lead.org}
                  <EditOutlined
                    onClick={() => setShowModal(true)}
                    style={{ marginLeft: "10px", fontSize: "16px" }}
                  />
                  <UpdateForm
                    visible={showUpModal}
                    onClose={() => setShowModal(false)}
                    roleId={role}
                    userId={id}
                    onSuccess={() => setOk(true)}
                    uType="leads"
                  />
                </Title>
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
                current={currentStep}
                onChange={(currentIndex) => {
                  shouldAllowStepChange(currentIndex)
                    ? onChangeStatusStep(currentIndex)
                    : null;
                }}
                className={`custom-steps ${
                  lead.status === "Failed" ? "failed-steps" : ""
                }`}
              >
                <Step
                  title={"Chưa liên hệ"}
                  description={renderStepDescription(0)}
                  icon={determineStepIcon(0)}
                />
                <Step
                  title={"Đã liên hệ"}
                  description={renderStepDescription(1)}
                  icon={determineStepIcon(1)}
                />
                <Step
                  title={"Đã xác định nhu cầu"}
                  description={renderStepDescription(2)}
                  icon={determineStepIcon(2)}
                />
                <Step
                  title={"Đã tư vấn"}
                  description={renderStepDescription(3)}
                  icon={determineStepIcon(3)}
                />
                <Step
                  title={"Thành công"}
                  description={renderStepDescription(4)}
                  icon={determineStepIcon(4)}
                />
              </Steps>
            </div>

            <h3 style={{ textAlign: "left" }}>History</h3>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "self-start",
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
                      key={index}
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
        title="Action for Status"
        visible={showModal}
        onCancel={() => {
          setPendingStatus("");
          setModal(false);
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setPendingStatus("");
              setModal(false);
            }}
            loading={isModalLoading}
          >
            Cancel
          </Button>,
          lead.status === "Failed" && (
            <Popconfirm
              title="Are you sure to delete this lead?"
              onConfirm={() => onDelete(id)}
              onCancel={null}
              okText="Yes"
              cancelText="No"
            >
              <Button key="delete" danger>
                Delete
              </Button>
            </Popconfirm>
          ),
          lead.status === "Failed" && (
            <Button
              key="succeed"
              type="primary"
              onClick={handleConfirmChange}
              loading={isModalLoading}
            >
              Change to Succeed
            </Button>
          ),
          lead.status !== "Failed" && (
            <Button
              key="failed"
              danger
              onClick={() => handleConfirmChange("Failed")}
              loading={isModalLoading}
            >
              Failed
            </Button>
          ),
          currentStep !== statusToIndex[pendingStatus] && (
            <Button
              key="confirm"
              type="primary"
              onClick={handleConfirmChange}
              loading={isModalLoading}
            >
              Confirm
            </Button>
          ),
        ]}
      >
        <p>Select an option for this step</p>
      </Modal>
    </>
  );
}
