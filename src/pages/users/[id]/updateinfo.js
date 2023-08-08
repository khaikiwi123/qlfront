import { useState, useEffect } from "react";
import api from "@/api/api";
import { useRouter } from "next/router";
import { Input, Button, Form, Layout, Row, Col } from "antd";
import AppHeader from "@/components/header";
import AppSider from "@/components/sider";
import Link from "next/link";
const { Content } = Layout;

const UpdateInfo = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [emailErr, setEmailErr] = useState("");
  const [loading, setLoading] = useState(false);
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
    setEmailErr("");
    setLoading(true);
    const data = {
      name,
      phone,
      email,
    };

    try {
      const response = await api.put(`/users/${id}`, data);
      console.log(response);
      router.push(`/users/${id}`);
    } catch (error) {
      console.error(error);
      const errorMsg = error.response.data.error;
      if (
        errorMsg === "Email already in use, please choose a different one." ||
        errorMsg === "Email isn't valid"
      ) {
        setEmailErr(errorMsg);
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
          <div style={{ padding: 24, minHeight: 360 }}>
            <Row justify="center">
              <Col span={8}>
                <h1>Update</h1>
                <Form onFinish={handleSubmit} layout="vertical">
                  <Form.Item label="Name">
                    <Input
                      placeholder="Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </Form.Item>
                  <Form.Item
                    label="Email"
                    validateStatus={emailErr ? "error" : ""}
                    help={emailErr}
                  >
                    <Input
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </Form.Item>
                  <Form.Item label="Phone">
                    <Input
                      placeholder="Phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>
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
  );
};

export default UpdateInfo;
