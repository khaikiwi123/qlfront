import { useState, useEffect } from "react";
import api from "@/api/api";
import Link from "next/link";
import Router from "next/router";
import { Form, Input, Button, Layout, message } from "antd";
import AppHeader from "@/components/header";
import AppSider from "@/components/sider";
import checkLogin from "@/Utils/checkLogin";
import { handleApiError } from "@/api/error";
import AppCrumbs from "@/components/breadcrumbs";

const { Content } = Layout;

const Create = () => {
  const [form] = Form.useForm();
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [id, setId] = useState("");
  const [emailErr, setEmailErr] = useState("");
  const [phoneErr, setPhoneErr] = useState("");
  const [saleErr, setSaleErr] = useState("");

  useEffect(() => {
    setId(localStorage.getItem("currUser"));
    setRole(localStorage.getItem("role"));
    setRole(localStorage.getItem("role"));
    const loggedIn = localStorage.getItem("logged_in");
    if (loggedIn !== "true") {
      checkLogin();
      return;
    }
  });

  const onFinish = async (values) => {
    setLoading(true);
    setEmailErr("");
    setPhoneErr("");
    setSaleErr("");

    try {
      await api.post(`/leads`, {
        ...values,
        inCharge: role === "admin" ? values.inCharge : id,
      });

      Router.push("/leads");
    } catch (error) {
      console.error(error);
      const { emailError, phoneError, saleError } = handleApiError(error, role);
      setEmailErr(emailError);
      setPhoneErr(phoneError);
      setSaleErr(saleError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style jsx global>{`
        body,
        html {
          margin: 0;
          padding: 0;
        }
      `}</style>
      <Layout style={{ minHeight: "100vh" }}>
        <AppHeader />
        <Layout style={{ marginLeft: 200, marginTop: 64, minHeight: "100vh" }}>
          <AppSider role={role} />
          <Content style={{ margin: "24px 16px 0" }}>
            <div
              style={{
                padding: 24,
                minHeight: 360,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <AppCrumbs
                paths={[
                  { name: "Home", href: "/home" },
                  { name: "Leads", href: "/leads" },
                  { name: "Create" },
                ]}
              />
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  maxWidth: "300px",
                  width: "100%",
                }}
              >
                <h1 style={{ fontSize: "2em", textAlign: "center" }}>
                  Create Lead
                </h1>
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={onFinish}
                  hideRequiredMark
                >
                  <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                      { required: true, message: "Please input your email!" },
                    ]}
                    help={emailErr}
                    validateStatus={emailErr ? "error" : ""}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    label="Phone"
                    name="phone"
                    rules={[
                      {
                        required: true,
                        message: "Please input your phone number!",
                      },
                    ]}
                    help={phoneErr}
                    validateStatus={phoneErr ? "error" : ""}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    label="Representer"
                    name="rep"
                    rules={[
                      { required: true, message: "Please input your rep!" },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    label="Organization"
                    name="org"
                    rules={[
                      { required: true, message: "Please input your org!" },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                  {role === "admin" && (
                    <Form.Item
                      label="Assign to"
                      name="inCharge"
                      rules={[
                        {
                          required: true,
                          message: "Please input the assigned personel",
                        },
                      ]}
                      help={saleErr}
                      validateStatus={saleErr ? "error" : ""}
                    >
                      <Input />
                    </Form.Item>
                  )}
                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      style={{ width: "100%" }}
                    >
                      Create
                    </Button>

                    <Link href="/leads">
                      <Button style={{ width: "100%", marginTop: "10px" }}>
                        Back to leads list
                      </Button>
                    </Link>
                  </Form.Item>
                </Form>
              </div>
            </div>
          </Content>
        </Layout>
      </Layout>
    </>
  );
};

export default Create;
