import { useState, useEffect } from "react";
import api from "@/api/api";
import Link from "next/link";
import Router from "next/router";
import useCheckLogin from "@/hooks/useCheckLogin";
import { Form, Input, Button, Layout, message } from "antd";
import AppHeader from "@/components/header";
import AppSider from "@/components/sider";

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
  });

  useCheckLogin();

  const onFinish = async (values) => {
    setLoading(true);
    setEmailErr("");
    setPhoneErr("");
    setSaleErr("");

    try {
      await api.post(`/clients`, {
        ...values,
        inCharge: role === "admin" ? values.inCharge : id,
      });

      if (role === "user") {
        Router.push("/clients/potential");
      } else if (role === "admin") {
        Router.push("/clients/all");
      }
    } catch (error) {
      console.error(error);
      const errorMsg = error.response.data.error;
      const clientId = error.response.data.clientId;

      if (errorMsg === "Client's email is already in the system") {
        if (clientId) {
          setEmailErr(
            <>
              {"Client existed. "}
              <span
                style={{ textDecoration: "underline", cursor: "pointer" }}
                onClick={() => {
                  window.open(`/clients/${clientId}`, "_blank");
                }}
              >
                View client's profile
              </span>
            </>
          );
        } else {
          setEmailErr(errorMsg);
        }
      } else if (errorMsg === "Email isn't valid") {
        setEmailErr(errorMsg);
      } else if (errorMsg === "Client's number is already in the system") {
        if (clientId) {
          setPhoneErr(
            <>
              {"Client existed. "}
              <span
                style={{ textDecoration: "underline", cursor: "pointer" }}
                onClick={() => {
                  window.open(`/clients/${clientId}`, "_blank");
                }}
              >
                View client's profile
              </span>
            </>
          );
        } else {
          setPhoneErr(errorMsg);
        }
      } else if (errorMsg === "Sale user doesn't exist") {
        setSaleErr(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <AppHeader />
      <Layout>
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
                Create Client
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
                  name="represent"
                  rules={[
                    { required: true, message: "Please input your represent!" },
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
                  {role === "admin" && (
                    <Link href="/clients/all">
                      <Button style={{ width: "100%", marginTop: "10px" }}>
                        Back to client list
                      </Button>
                    </Link>
                  )}
                  {role === "user" && (
                    <Link href="/clients/potential">
                      <Button style={{ width: "100%", marginTop: "10px" }}>
                        Back to potential client list
                      </Button>
                    </Link>
                  )}
                </Form.Item>
              </Form>
            </div>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Create;
