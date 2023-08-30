import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import dayjs from "dayjs";

import { Layout, Typography, Spin, message, Descriptions } from "antd";
import { EditOutlined } from "@ant-design/icons";
const { Content } = Layout;
const { Title, Text } = Typography;

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
  const [updateOk, setOk] = useState(false);

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
      label: "Phone Number",
      children: lead.phone,
    },
    {
      key: "3",
      label: "Representative",
      children: lead.rep,
    },
    {
      key: "4",
      label: "Person In Charge",
      children: lead.inCharge,
    },
    {
      key: "5",
      label: "Created Date",
      children: dayjs(lead.createdDate).format("DD/MM/YYYY"),
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
                  marginTop: 80,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  borderBottom: "1px solid #A9A9A9",
                  borderTop: "1px solid #A9A9A9",
                }}
              >
                <Title style={{ marginTop: -5 }}>
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
                <Descriptions
                  size="small"
                  layout="vertical"
                  items={items}
                  style={{ marginLeft: 50, marginBottom: 20 }}
                />
              </div>
            </div>

            <div className="steps-container">
              <AppStep
                id={id}
                status={lead.status}
                trackStatus={lead.trackStatus}
                email={lead.email}
                setLead={setLead}
                fetchChangeLogs={fetchChangeLogs}
              />
            </div>

            <h3 style={{ textAlign: "left" }}>History</h3>
            <AppHistory id={id} changeLog={changeLog} />
          </Content>
        </Layout>
      </Layout>
    </>
  );
}
