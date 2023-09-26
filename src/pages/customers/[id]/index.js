import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import dayjs from "dayjs";

import { Layout, Spin, message, Descriptions, Button } from "antd";

import AppHeader from "@/components/header";
import AppSider from "@/components/sider";
import AppCrumbs from "@/components/breadcrumbs";
import UpdateForm from "@/components/updateForm";
import { UserProvider } from "@/context/context";

import api from "@/api/api";
import checkLogin from "@/Utils/checkLogin";
import useLogout from "@/hooks/useLogout";
import authErr from "@/api/authErr";

const { Content } = Layout;

export default function Customer() {
  const router = useRouter();
  const id = router.query.id;

  const [customer, setCustomer] = useState(null);
  const [bill, setBill] = useState(null);
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
    fetchCustomer();
  }, [id, router, updateOk]);

  const fetchCustomer = () => {
    api
      .get(`/customers/${id}`)
      .then((response) => {
        setCustomer(response.data);
        setBill(response.data.bill);
      })
      .catch((err) => {
        console.error(err);
        authErr(err, logOut);
        if (err.response?.data?.error === "Not authorized") {
          message.error("Bạn không có quyền để xem khách hàng này");

          router.push("/customers/");
        }
      });
  };

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
      label: "Số điện thoại",
      children: customer.phone,
    },
    {
      key: "3",
      label: "Người đại diện",
      children: customer.rep,
    },
    {
      key: "4",
      label: "Người chịu trách nhiệm",
      children: customer.saleName,
    },
    {
      key: "5",
      label: "Ngày tạo",
      children: dayjs(customer.createdDate).format("DD/MM/YYYY"),
    },
  ];
  const billItem = [
    {
      key: "1",
      label: "Giá",
      children: `${bill.price} đồng`,
    },
    {
      key: "2",
      label: "Độ dài",
      children: `${bill.length} tháng`,
    },
    {
      key: "3",
      label: "Trạng thái",
      children: bill.status,
    },
    {
      key: "4",
      label: "Thời hạn từ",
      children: dayjs(bill.startDate).format("DD/MM/YYYY"),
    },
    {
      key: "5",
      label: "Hết hạn",
      children: dayjs(bill.startDate)
        .add(30 * bill.length, "day")
        .format("DD/MM/YYYY"),
    },
  ];

  return (
    <>
      <UserProvider>
        {" "}
        <Layout style={{ minHeight: "100vh" }}>
          <AppHeader />
          <Layout className="layoutC">
            <AppSider role={role} />
            <Content style={{ margin: "64px 16px 0" }}>
              <AppCrumbs paths={[{ name: "Customers", href: "/customers" }]} />
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
                  title={
                    <div style={{ whiteSpace: "normal", fontSize: "25px" }}>
                      {customer.org}
                    </div>
                  }
                  size="small"
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
                <UpdateForm
                  visible={showModal}
                  onClose={() => setModal(false)}
                  roleId={role}
                  userId={id}
                  customer={customer}
                  onSuccess={() => setOk(true)}
                  uType="customers"
                />
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  borderBottom: "1px solid #A9A9A9",
                }}
              >
                <Descriptions
                  title={
                    <div
                      style={{
                        whiteSpace: "normal",
                        fontSize: "18px",
                        marginTop: 15,
                      }}
                    >
                      {bill.product}
                    </div>
                  }
                  size="small"
                  layout="vertical"
                  labelStyle={{}}
                  contentStyle={{
                    fontWeight: "400",
                    color: "black",
                    marginTop: -15,
                  }}
                  items={billItem}
                  className="Desc"
                  colon={false}
                />
              </div>
            </Content>
          </Layout>
        </Layout>
      </UserProvider>
    </>
  );
}
