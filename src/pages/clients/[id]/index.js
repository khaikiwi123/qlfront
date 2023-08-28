import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import dayjs from "dayjs";

import { Layout, Typography, Spin, message } from "antd";
import { EditOutlined } from "@ant-design/icons";

import AppHeader from "@/components/header";
import AppSider from "@/components/sider";
import AppCrumbs from "@/components/breadcrumbs";
import UpdateForm from "@/components/updateForm";

import api from "@/api/api";
import checkLogin from "@/Utils/checkLogin";
import useLogout from "@/hooks/useLogout";
import authErr from "@/api/authErr";

const { Content } = Layout;
const { Title, Text } = Typography;

export default function Client() {
  const router = useRouter();
  const id = router.query.id;

  const [client, setClient] = useState(null);
  const [role, setRole] = useState("");
  const [showModal, setModal] = useState(false);
  const [updateOk, setOk] = useState(false);

  const { logOut } = useLogout();

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
        authErr(err, logOut);
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
  }, [id, router, updateOk]);

  if (client === null) {
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
            <AppCrumbs
              paths={[
                { name: "Customers", href: "/clients" },
                { name: "Profile" },
              ]}
            />
            <div
              style={{
                minHeight: 360,
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
                  {client.org}
                  <EditOutlined
                    onClick={() => setModal(true)}
                    style={{ marginLeft: "10px", fontSize: "16px" }}
                  />
                </Title>

                <UpdateForm
                  visible={showModal}
                  onClose={() => setModal(false)}
                  roleId={role}
                  userId={id}
                  onSuccess={() => setOk(true)}
                  uType="clients"
                />

                <br />
                <Text>Email: {client.email}</Text>
                <br />
                <Text>Phone: {client.phone}</Text>
                <br />

                <Text>Representative: {client.rep}</Text>
                <br />

                <Text>
                  Created At: {dayjs(client.createdDate).format("DD/MM/YYYY")}
                </Text>
              </div>
            </div>
          </Content>
        </Layout>
      </Layout>
    </>
  );
}
