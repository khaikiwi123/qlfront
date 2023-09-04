import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import dayjs from "dayjs";

import { Layout, Typography, Spin, message, Descriptions, Button } from "antd";

import AppHeader from "@/components/header";
import AppSider from "@/components/sider";
import AppCrumbs from "@/components/breadcrumbs";
import UpdateForm from "@/components/updateForm";

import api from "@/api/api";
import checkLogin from "@/Utils/checkLogin";
import useLogout from "@/hooks/useLogout";
import authErr from "@/api/authErr";

const { Content } = Layout;
const { Title } = Typography;

export default function Customer() {
  const router = useRouter();
  const id = router.query.id;

  const [customer, setCustomer] = useState(null);
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
      .get(`/customers/${id}`)
      .then((response) => {
        setCustomer(response.data);
      })
      .catch((err) => {
        console.error(err);
        authErr(err, logOut);
        const inchargeEmail = err.response?.data?.incharge;

        if (err.response?.data?.error === "Not authorized") {
          message.error(
            `You are not authorized to view this customer. ${
              inchargeEmail
                ? `${inchargeEmail} is in charge of this customer.`
                : "(It belonged to another salesperson)"
            }`
          );

          router.push("/customers/");
        }
      });
  }, [id, router, updateOk]);

  if (customer === null) {
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
      children: customer.email,
    },
    {
      key: "2",
      label: "Phone Number",
      children: customer.phone,
    },
    {
      key: "3",
      label: "Representative",
      children: customer.rep,
    },
    {
      key: "4",
      label: "Person In Charge",
      children: customer.inCharge,
    },
    {
      key: "5",
      label: "Created Date",
      children: dayjs(customer.createdDate).format("DD/MM/YYYY"),
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
              paths={[
                { name: "Customers", href: "/customers" },
                { name: "Profile" },
              ]}
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
              <Descriptions
                title={customer.org}
                extra={
                  <Button
                    onClick={() => setModal(true)}
                    type="primary"
                    ghost
                    style={{
                      marginLeft: "10px",
                      fontSize: "16px",
                      minWidth: "100px",
                    }}
                  >
                    Edit
                  </Button>
                }
                layout="vertical"
                labelStyle={{}}
                contentStyle={{
                  fontWeight: "600",
                  color: "black",
                  marginTop: -15,
                }}
                items={items}
                className="Desc"
                colon={false}
              />
              <UpdateForm
                visible={showModal}
                onClose={() => setModal(false)}
                roleId={role}
                userId={id}
                onSuccess={() => setOk(true)}
                uType="leads"
              />
            </div>
          </Content>
        </Layout>
      </Layout>
    </>
  );
}
