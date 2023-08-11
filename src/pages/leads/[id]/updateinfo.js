import { useEffect, useState } from "react";
import api from "@/api/api";
import { useRouter } from "next/router";
import { Form, Input, Button, Layout, Row, Col } from "antd";
import AppHeader from "@/components/header";
import AppSider from "@/components/sider";
import Link from "next/link";
import checkLogin from "@/Utils/checkLogin";
import AppCrumbs from "@/components/breadcrumbs";
const { Content } = Layout;
import { handleApiError } from "@/api/error";

const Update = () => {
  const router = useRouter();
  const id = router.query.id;
  const [email, setEmail] = useState("");
  const [emailErr, setEmailErr] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneErr, setPhoneErr] = useState("");
  const [org, setOrg] = useState("");
  const [rep, setRep] = useState("");
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("");

  useEffect(() => {
    setRole(localStorage.getItem("role"));
    const loggedIn = localStorage.getItem("logged_in");
    if (loggedIn !== "true") {
      checkLogin();
      return;
    }
  }, []);

  const handleSubmit = async (e) => {
    setEmailErr("");
    setPhoneErr("");
    setLoading(true);
    const data = {
      email,
      phone,
      org,
      rep,
    };
    try {
      const response = await api.put(`/leads/${id}`, data);
      console.log(response);
      router.push(`/leads/${id}`);
    } catch (error) {
      console.error(error);
      const { emailError, phoneError } = handleApiError(error, role);
      setEmailErr(emailError);
      setPhoneErr(phoneError);
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
            <div style={{ padding: 24, minHeight: 360 }}>
              <Row justify="center">
                <Col span={12}>
                  <AppCrumbs
                    paths={[
                      { name: "Leads", href: "/leads" },
                      { name: "Profile", href: `/leads/${id}` },
                      { name: "Update" },
                    ]}
                  />
                  <h1>Update Lead</h1>
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
                    <Form.Item label="Representative">
                      <Input
                        value={rep}
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
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                      >
                        Update
                      </Button>
                    </Form.Item>
                  </Form>
                  <Button type="primary">
                    <Link href={`/leads/${id}`}>Back to lead's profile</Link>
                  </Button>
                </Col>
              </Row>
            </div>
          </Content>
        </Layout>
      </Layout>
    </>
  );
};

export default Update;
