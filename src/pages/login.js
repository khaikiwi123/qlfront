import { Form, Input, Button, Typography, Layout } from "antd";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import useLogin from "../hooks/useLogin";

const { Title } = Typography;
const { Content } = Layout;

const Login = (e) => {
  const {
    email,
    setEmail,
    password,
    setPassword,
    errMsg,
    loading,
    handleSubmit,
  } = useLogin(e);

  const emailErrorMsg = errMsg === "Wrong password" ? "" : errMsg;
  const passwordErrorMsg =
    errMsg === "Wrong password" ? "Thông tin không chính xác" : "";

  return (
    <Layout
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Content>
        <Title level={2}>Đăng nhập</Title>
        <Form onFinish={handleSubmit}>
          <Form.Item
            validateStatus={emailErrorMsg ? "error" : ""}
            help={emailErrorMsg}
          >
            <Input
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
              style={{ height: "40px", width: "280px" }}
            />
          </Form.Item>
          <Form.Item
            validateStatus={passwordErrorMsg ? "error" : ""}
            help={passwordErrorMsg}
          >
            <Input.Password
              id="password"
              placeholder="Mật khẩu"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
              style={{ height: "40px", width: "280px" }}
              iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
            />
          </Form.Item>
          <Form.Item>
            <Button
              style={{ height: "40px", width: "160px" }}
              type="primary"
              htmlType="submit"
              disabled={loading}
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </Form.Item>
        </Form>
      </Content>
    </Layout>
  );
};

export default Login;
