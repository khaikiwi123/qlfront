import { useState } from "react";
import { Modal, Form, Input, Button, message, Tabs } from "antd";
import api from "@/api/api";
import { EyeTwoTone, EyeInvisibleOutlined } from "@ant-design/icons";

import { metaErr } from "@/api/userMetaErr";
import authErr from "@/api/authErr";
import useLogout from "@/hooks/useLogout";

const { TabPane } = Tabs;

const ProfileUpForm = ({ visible, onClose, onSuccess, userId }) => {
  const [userInfoForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("1");

  const { logOut } = useLogout();

  const onFinishUserInfo = async (values) => {
    setLoading(true);
    try {
      await api.put(`/users/${userId}`, { ...values });
      userInfoForm.resetFields();
      if (onSuccess) {
        onSuccess();
      }
      message.success("Cập nhập thành công");
      onClose();
    } catch (error) {
      console.error(error);
      authErr(error, logOut);
      metaErr(error);
    } finally {
      setLoading(false);
    }
  };

  const onFinishPassword = async (values) => {
    setLoading(true);
    try {
      await api.put(`/users/${userId}`, { ...values });
      passwordForm.resetFields();
      if (onSuccess) {
        onSuccess();
      }
      message.success("Cập nhập mật khẩu thành công");
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
      title="Cập nhập người dùng"
      onCancel={onClose}
      footer={null}
    >
      <Tabs
        activeKey={activeTab}
        onChange={(key) => {
          if (key === "1") {
            userInfoForm.resetFields();
          } else {
            passwordForm.resetFields();
          }
          setActiveTab(key);
        }}
        type="card"
      >
        <TabPane tab="Thông tin người dùng" key="1">
          <Form
            form={userInfoForm}
            layout="vertical"
            onFinish={onFinishUserInfo}
          >
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
                      return Promise.reject("Email không hợp lệ");
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
                      return Promise.reject("Số điện thoại không hợp lệ");
                    }
                  },
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                style={{ width: "100%" }}
              >
                Cập nhập thông tin
              </Button>
            </Form.Item>
          </Form>
        </TabPane>
        <TabPane tab="Mật khẩu" key="2">
          <Form
            form={passwordForm}
            layout="vertical"
            onFinish={onFinishPassword}
          >
            <Form.Item
              label="Mật khẩu cũ"
              name="oldPassword"
              validateFirst="true"
              rules={[
                {
                  required: true,
                  message: "Cần nhập mật khẩu cũ",
                },
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
                      return Promise.reject("Mật khẩu không hợp lệ");
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
              label="Mật khẩu mới"
              name="newPassword"
              validateFirst="true"
              rules={[
                {
                  required: true,
                  message: "Cần nhập mật khẩu mới",
                },
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
                      return Promise.reject("Mật khẩu không hợp lệ");
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
              label="Nhập lại mật khẩu mới"
              name="confirmNewPassword"
              rules={[
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (getFieldValue("newPassword") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Mật khẩu không khớp"));
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
                Đổi mật khẩu
              </Button>
            </Form.Item>
          </Form>
        </TabPane>
      </Tabs>
    </Modal>
  );
};

export default ProfileUpForm;
