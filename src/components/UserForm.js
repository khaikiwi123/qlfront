import { useState } from "react";
import { Modal, Form, Input, Button, Select } from "antd";
import api from "@/api/api";
import { EyeTwoTone, EyeInvisibleOutlined } from "@ant-design/icons";

import { metaErr } from "@/api/userMetaErr";
import authErr from "@/api/authErr";
import useLogout from "@/hooks/useLogout";

const { Option } = Select;

const CreateForm = ({ visible, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const { logOut } = useLogout();

  const onFinish = async (values) => {
    setLoading(true);

    try {
      await api.post(`/users`, {
        ...values,
      });
      form.resetFields();
      if (onSuccess) {
        onSuccess();
      }

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
      title="Create Lead"
      onCancel={onClose}
      footer={null}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Email"
          name="email"
          validateFirst="true"
          rules={[
            { required: true, message: "Please input your email!" },
            {
              message: "Email isn't valid",
              validator: (_, value) => {
                if (/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value)) {
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
        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: "Please input your name!" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Phone"
          name="phone"
          validateFirst="true"
          rules={[
            {
              required: true,
              message: "Please input your phone number!",
            },
            {
              message: "Phone number isn't valid",
              validator: (_, value) => {
                if (
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
        <Form.Item
          label="Role"
          name="role"
          rules={[{ required: true, message: "Please select a role!" }]}
        >
          <Select placeholder="Select a role">
            <Option value="user">User</Option>
            <Option value="admin">Admin</Option>
          </Select>
        </Form.Item>
        <Form.Item
          label="Password"
          name="password"
          validateFirst="true"
          rules={[
            {
              required: true,
              message: "Please input your password!",
            },
            {
              message: "Password isn't strong enough",
              validator: (_, value) => {
                if (
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
            {
              required: true,
              message: "Please confirm your password!",
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error("The two passwords that you entered do not match!")
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
            Create
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateForm;
