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
  const [activeTab, setActiveTab] = useState("1");

  const { logOut } = useLogout();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await api.put(`/users/${userId}`, { ...values });
      form.resetFields();
      if (onSuccess) {
        onSuccess();
      }
      message.success(
        values.newPassword ? "Đổi mật khẩu thành công" : "Cập nhập thành công"
      );
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
      centered
      title="Cập nhập thông tin người dùng"
      onCancel={onClose}
      footer={null}
    >
      <Tabs
        activeKey={activeTab}
        onChange={(key) => {
          form.resetFields();
          setActiveTab(key);
        }}
        type="card"
      >
        <TabPane tab="Thông tin" key="1">
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item
              label="Email"
              name="email"
              validateFirst="true"
              rules={[
                {
                  message: "Email không hợp lệ",
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
            <Form.Item label="Tên" name="name">
              <Input />
            </Form.Item>
            <Form.Item
              label="Số điện thoại"
              name="phone"
              validateFirst="true"
              rules={[
                {
                  message: "Số điện thoại không hợp lệ",
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
            <Form.Item label="Vai trò" name="role">
              <Select placeholder="Chọn vai trò">
                <Option value="user">Nhân viên sale</Option>
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
                Cập nhập
              </Button>
            </Form.Item>
          </Form>
        </TabPane>
        <TabPane tab="Mật khẩu" key="2">
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item
              label="Mật khẩu mới"
              name="newPassword"
              validateFirst="true"
              rules={[
                {
                  message:
                    "Mật khẩu không đủ khỏe (Cần ít nhất 1 chữ hoa, 1 chữ thường, 1 số, 1 ký tự đặc biệt với độ dài từ 8-18)",
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
              label="Nhập lại mật khẩu"
              name="confirmPassword"
              rules={[
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (getFieldValue("newPassword") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("Mật khẩu không trùng khớp")
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
