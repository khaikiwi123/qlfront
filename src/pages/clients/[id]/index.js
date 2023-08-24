import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import dayjs from "dayjs";

import { Layout, Button, Typography, Spin, Avatar, message } from "antd";
import { EditOutlined } from "@ant-design/icons";

import AppHeader from "@/components/header";
import AppSider from "@/components/sider";
import AppCrumbs from "@/components/breadcrumbs";

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
  const [editMode, setEditMode] = useState(false);

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
  }, [id, router]);

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
        <Layout style={{ marginLeft: 200, marginTop: 64, minHeight: "100vh" }}>
          <AppSider role={role} />
          <Content style={{ margin: "24px 16px 0" }}>
            <div style={{ padding: 24, minHeight: 360 }}>
              <AppCrumbs
                paths={[
                  { name: "Customers", href: "/clients" },
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
                  <Text>Representative: {client.rep}</Text>
                  <br />

                  <Text>
                    Created At: {dayjs(client.createdDate).format("DD/MM/YYYY")}
                  </Text>
                </div>
              </div>
            </div>
          </Content>
        </Layout>
      </Layout>
    </>
  );
}
