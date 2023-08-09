import { useState, useEffect } from "react";
import api from "@/api/api";
import { useRouter } from "next/router";
import { Input, Button, Form, Layout, Row, Col } from "antd";
import AppHeader from "@/components/header";
import AppSider from "@/components/sider";
import Link from "next/link";
import checkLogin from "@/Utils/checkLogin";
const { Content } = Layout;

const UpdateUserPW = () => {
  const [newPassword, setNewPassword] = useState("");
  const [newPassErr, setNewPassErr] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmErr, setConfirmErr] = useState("");
  const [loadingUpdate, setUpdate] = useState(false);
  const [role, setRole] = useState("");

  const router = useRouter();
  const id = router.query.id;

  useEffect(() => {
    setRole(localStorage.getItem("role"));
    const loggedIn = localStorage.getItem("logged_in");
    if (loggedIn !== "true") {
      checkLogin();
      return;
    }
  }, []);

  const handleSubmit = async () => {
    setNewPassErr("");
    setConfirmErr("");
    setUpdate(true);
    if (newPassword.trim() !== confirmPassword.trim()) {
      setConfirmErr("Passwords do not match!");
      setUpdate(false);
    }
    const data = {
      newPassword,
    };

    try {
      const response = await api.put(`/users/${id}`, data);
      console.log(response);
      router.push(`/users/${id}`);
    } catch (error) {
      console.error(error);
      const errMsg = error.response.data.error;
      if (
        errMsg === "Password is too long" ||
        errMsg === "Password isn't strong enough"
      ) {
        setNewPassErr(errMsg);
      }
    } finally {
      setUpdate(false);
    }
  };

  return (
    <>
      {" "}
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
            <div style={{ padding: 24, minHeight: 360 }}>
              <Row justify="center">
                <Col span={8}>
                  <h1>Update Password</h1>
                  <Form onFinish={handleSubmit} layout="vertical">
                    <Form.Item
                      label="New Password"
                      validateStatus={newPassErr ? "error" : ""}
                      help={newPassErr}
                    >
                      <Input.Password
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </Form.Item>
                    <Form.Item
                      label="Confirm New Password"
                      validateStatus={confirmErr ? "error" : ""}
                      help={confirmErr}
                    >
                      <Input.Password
                        placeholder="Confirm New Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </Form.Item>
                    <Form.Item>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={loadingUpdate}
                      >
                        Update
                      </Button>
                    </Form.Item>
                    <Form.Item>
                      <Button type="default">
                        <Link href={`/users/${id}`}>
                          Back to user&apos;s profile
                        </Link>
                      </Button>
                    </Form.Item>
                  </Form>
                </Col>
              </Row>
            </div>
          </Content>
        </Layout>
      </Layout>
    </>
  );
};

export default UpdateUserPW;
