import { useState, useEffect } from "react";
import api from "@/api/api";
import Link from "next/link";
import Router from "next/router";
import useCheckLogin from "@/hooks/useCheckLogin";
import { Form, Input, Button, Layout, Select } from "antd";
import { EyeTwoTone, EyeInvisibleOutlined } from "@ant-design/icons";
import AppHeader from "@/components/header";
import AppSider from "@/components/sider";

const { Content } = Layout;
const { Option } = Select;

const Create = () => {
  const [form] = Form.useForm();
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setRole(localStorage.getItem("role"));
  });

  useCheckLogin();

  const onFinish = async (values) => {
    setLoading(true);

    try {
      await api.post(`/users/`, { ...values });
      Router.push("/users");
    } catch (error) {
      setLoading(false);
      console.error(error);

      const errorMsg = error.response.data.error; // Assuming error message comes like this from API

      // Now check which error it is and set it on the right field
      if (errorMsg.includes("User already existed")) {
        form.setFields([
          {
            name: "email",
            errors: ["User already existed, please login."],
          },
        ]);
      } else if (errorMsg.includes("Email isn't valid")) {
        form.setFields([
          {
            name: "email",
            errors: ["Email isn't valid"],
          },
        ]);
      } else if (errorMsg.includes("Password is too long")) {
        form.setFields([
          {
            name: "password",
            errors: ["Password is too long"],
          },
        ]);
      } else if (errorMsg.includes("Password isn't strong enough")) {
        form.setFields([
          {
            name: "password",
            errors: ["Password isn't strong enough"],
          },
        ]);
      }
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
                Create User
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
                    { type: "email", message: "Email is not valid!" },
                  ]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="Name"
                  name="name"
                  rules={[
                    { required: true, message: "Please input your name!" },
                  ]}
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
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="Role"
                  name="role"
                  rules={[{ required: true, message: "Please select a role!" }]}
                >
                  <Select placeholder="Select a role">
                    <Option value="user">User</Option>
                    <Option value="admin">Admin</Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  label="Password"
                  name="password"
                  rules={[
                    { required: true, message: "Please input your password!" },
                  ]}
                >
                  <Input.Password
                    iconRender={(visible) =>
                      visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                    }
                  />
                </Form.Item>
                <Form.Item
                  label="Confirm Password"
                  name="confirmPassword"
                  rules={[
                    {
                      required: true,
                      message: "Please confirm your password!",
                    },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("password") === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error(
                            "The two passwords that you entered do not match!"
                          )
                        );
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    iconRender={(visible) =>
                      visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                    }
                  />
                </Form.Item>
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    style={{ width: "100%" }}
                  >
                    Create
                  </Button>
                  <Link href="/users/">
                    <Button style={{ width: "100%", marginTop: "10px" }}>
                      Back to users list
                    </Button>
                  </Link>
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
