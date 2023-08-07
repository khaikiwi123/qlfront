import { useEffect, useState } from "react";
import api from "@/api/api";
import { useRouter } from "next/router";
import useCheckLogin from "@/hooks/useCheckLogin";
import { Form, Input, Button, Layout, Row, Col } from "antd";
import AppHeader from "@/components/header";
import AppSider from "@/components/sider";

const { Content } = Layout;

const Update = () => {
  const router = useRouter();
  const id = router.query.id;
  const [email, setEmail] = useState("");
  const [emailErr, setEmailErr] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneErr, setPhoneErr] = useState("");
  const [org, setOrg] = useState("");
  const [represent, setRep] = useState("");
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("");

  useCheckLogin();

  useEffect(() => {
    setRole(localStorage.getItem("role"));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailErr("");
    setPhoneErr("");
    setLoading(true);
    const data = {
      email,
      phone,
      org,
      represent,
    };
    try {
      const response = await api.put(`/clients/${id}`, data);
      console.log(response);
      router.push(`/clients/${id}`);
    } catch (error) {
      console.error(error);
      const errorMsg = error.response.data.error;
      if (
        errorMsg === "Email already in use, please choose a different one." ||
        errorMsg === "Email isn't valid"
      ) {
        setEmailErr(errorMsg);
      } else if (
        errorMsg ===
        "Phone number already in use, please choose a different one."
      ) {
        setPhoneErr(errorMsg);
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
              <Col span={12}>
                <h1>Update Client</h1>
                <Form onFinish={handleSubmit} layout="vertical">
                  <Form.Item
                    label="Email"
                    validateStatus={emailErr ? "error" : ""}
                    help={emailErr}
                  >
                    <Input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </Form.Item>
                  <Form.Item
                    label="Phone"
                    validateStatus={phoneErr ? "error" : ""}
                    help={phoneErr}
                  >
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </Form.Item>
                  <Form.Item label="Representer">
                    <Input
                      value={represent}
                      onChange={(e) => setRep(e.target.value)}
                    />
                  </Form.Item>
                  <Form.Item label="Organization">
                    <Input
                      value={org}
                      onChange={(e) => setOrg(e.target.value)}
                    />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>
                      Update
                    </Button>
                  </Form.Item>
                </Form>
                <Button type="link" href={`/clients/${id}`}>
                  Back to clients profile
                </Button>
              </Col>
            </Row>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Update;
