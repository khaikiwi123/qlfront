import { useState } from "react";
import { Modal, Form, Input, Button, Select, message, Tabs } from "antd";
import api from "@/api/api";
import { EyeTwoTone, EyeInvisibleOutlined } from "@ant-design/icons";

import { metaErr } from "@/api/userMetaErr";
import authErr from "@/api/authErr";
import useLogout from "@/hooks/useLogout";

const { TabPane } = Tabs;
const { Option } = Select;

const UserUpForm = ({ visible, onClose, onSuccess, userId }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { logOut } = useLogout();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await api.put(`/users/${userId}`, { ...values });
      form.resetFields();
      if (onSuccess) {
        onSuccess();
      }
      message.success(values.newPassword ? "Password updated" : "User updated");
      onClose();
    } catch (error) {
      console.error(error);
      authErr(error, logOut);
      metaErr(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      title="Update User"
      onCancel={onClose}
      footer={null}
    >
      <Tabs defaultActiveKey="1" type="card">
        <TabPane tab="User Info" key="1">
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item
              label="Email"
              name="email"
              validateFirst="true"
              rules={[
                {
                  message: "Email isn't valid",
                  validator: (_, value) => {
                    if (
                      !value ||
                      /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value)
                    ) {
                      return Promise.resolve();
                    } else {
                      return Promise.reject("Email is invalid");
                    }
                  },
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item label="Name" name="name">
              <Input />
            </Form.Item>
            <Form.Item
              label="Phone"
              name="phone"
              validateFirst="true"
              rules={[
                {
                  message: "Phone number isn't valid",
                  validator: (_, value) => {
                    if (
                      !value ||
                      /^((\+?84)|0)((3([2-9]))|(5([25689]))|(7([0|6-9]))|(8([1-9]))|(9([0-9])))([0-9]{7})$/.test(
                        value
                      )
                    ) {
                      return Promise.resolve();
                    } else {
                      return Promise.reject("Phone is invalid");
                    }
                  },
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item label="Role" name="role">
              <Select placeholder="Select a role">
                <Option value="user">User</Option>
                <Option value="admin">Admin</Option>
              </Select>
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                style={{ width: "100%" }}
              >
                Update
              </Button>
            </Form.Item>
          </Form>
        </TabPane>
        <TabPane tab="Password" key="2">
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item
              label="Password"
              name="newPassword"
              validateFirst="true"
              rules={[
                {
                  message: "Password isn't strong enough",
                  validator: (_, value) => {
                    if (
                      !value ||
                      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,18}$/.test(
                        value
                      )
                    ) {
                      return Promise.resolve();
                    } else {
                      return Promise.reject("Password is invalid");
                    }
                  },
                },
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
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (getFieldValue("newPassword") === value) {
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
                Update Password
              </Button>
            </Form.Item>
          </Form>
        </TabPane>
      </Tabs>
    </Modal>
  );
};

export default UserUpForm;
