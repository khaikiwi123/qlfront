import { useEffect, useState } from "react";
import api from "../../api/api";
import Link from "next/link";
import Router from "next/router";
import useCheckLogin from "../../hooks/useCheckLogin";
import { Form, Input, Button, Layout, Alert, Row, Col } from "antd";
import AppHeader from "@/components/header";
import AppSider from "@/components/sider";

const { Content } = Layout;

const UpdateUserPW = () => {
  const [id, setID] = useState("");
  const [role, setRole] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPassErr, setNewPassErr] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [oldPassErr, setOldPassErr] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmErr, setConfirmErr] = useState("");
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  useCheckLogin();

  useEffect(() => {
    setID(localStorage.getItem("currID"));
    setRole(localStorage.getItem("role"));
  }, []);

  const handleSubmit = async (e) => {
    setNewPassErr("");
    setOldPassErr("");
    setConfirmErr("");
    setLoadingUpdate(true);
    if (newPassword.trim() !== confirmPassword.trim()) {
      setConfirmErr("Passwords do not match!");
      setLoadingUpdate(false);
    }
    const data = {
      newPassword,
      oldPassword,
    };

    try {
      const response = await api.put(`/users/${id}`, data);
      console.log(response);
      Router.push("/profile");
    } catch (error) {
      console.error(error);
      const errMsg = error.response.data.error;
      if (errMsg === "Please fill out all the form.") {
        setOldPassErr(oldPassword ? "" : "This field is required");
        setNewPassErr(newPassword ? "" : "This field is required");
        setConfirmErr(confirmPassword ? "" : "This field is required");
      } else if (
        errMsg === "Password is too long" ||
        errMsg === "Password isn't strong enough"
      ) {
        setNewPassErr(errMsg);
      } else if (errMsg === "Old password is incorrect") {
        setOldPassErr(errMsg);
      }
    } finally {
      setLoadingUpdate(false);
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <AppHeader />
      <Layout>
        <AppSider role={role} />
        <Content style={{ margin: "24px 16px 0" }}>
          <div style={{ padding: 24, minHeight: 360 }}>
            <Row justify="center">
              <Col span={12}>
                <h2>Update Password</h2>
                <Form onFinish={handleSubmit} layout="vertical">
                  <Form.Item
                    label="Old Password"
                    validateStatus={oldPassErr ? "error" : ""}
                    help={oldPassErr}
                  >
                    <Input.Password
                      placeholder="Old Password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      visibilityToggle={true}
                    />
                  </Form.Item>
                  <Form.Item
                    label="New Password"
                    validateStatus={newPassErr ? "error" : ""}
                    help={newPassErr}
                  >
                    <Input.Password
                      placeholder="New Password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      visibilityToggle={true}
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
                      visibilityToggle={true}
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
                </Form>
                <Link href={`/profile/`}>
                  <Button>Back to profile</Button>
                </Link>
              </Col>
            </Row>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default UpdateUserPW;
