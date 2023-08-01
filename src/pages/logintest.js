import { Form, Input, Button, Typography } from "antd";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import useLogin from "../hooks/useLogin";

const { Title } = Typography;

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
  const passwordErrorMsg = errMsg === "Wrong password" ? errMsg : "";

  return (
    <section>
      <Title level={2}>Sign In</Title>
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
            placeholder="Password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
            style={{ height: "40px", width: "280px" }}
            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
          />
        </Form.Item>
        <Form.Item>
          <Button
            style={{ height: "40px", width: "160px" }}
            type="primary"
            htmlType="submit"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Log in"}
          </Button>
        </Form.Item>
      </Form>
    </section>
  );
};

export default Login;