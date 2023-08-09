import { useEffect, useState } from "react";
import api from "@/api/api";
import { useRouter } from "next/router";
import { Form, Input, Button, Layout, Row, Col } from "antd";
import AppHeader from "@/components/header";
import AppSider from "@/components/sider";
import Link from "next/link";
import checkLogin from "@/Utils/checkLogin";
const { Content } = Layout;

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
      router.push(`/clients/${id}`);
    } catch (error) {
      console.error(error);
      const errorMsg = error.response.data.error;
      const leadId = error.response.data.leadId;
      const inChargeEmail = error.response.data.incharge;
      const currUserEmail = localStorage.getItem("currUser");

      if (
        (errorMsg === "Email existed" || errorMsg === "Phone existed") &&
        role !== "admin" &&
        currUserEmail !== inChargeEmail
      ) {
        const message = `${inChargeEmail} is in charge of this lead.`;
        if (errorMsg === "Email existed") {
          setEmailErr(message);
        } else {
          setPhoneErr(message);
        }
      } else {
        if (errorMsg === "Email existed") {
          if (leadId) {
            setEmailErr(
              <>
                {"Lead existed. "}
                <span
                  style={{
                    textDecoration: "underline",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    window.open(`/clients/${leadId}`, "_blank");
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
        } else if (errorMsg === "Phone existed") {
          if (leadId) {
            setPhoneErr(
              <>
                {"Lead existed. "}
                <span
                  style={{
                    textDecoration: "underline",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    window.open(`/clients/${leadId}`, "_blank");
                  }}
                >
                  View lead's profile
                </span>
              </>
            );
          } else {
            setPhoneErr(errorMsg);
          }
        }
      }
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
                    <Link href={`/clients/${id}`}>Back to clients profile</Link>
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
