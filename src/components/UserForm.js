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
      centered
      title="Tạo người dùng"
      onCancel={onClose}
      footer={null}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Email"
          name="email"
          validateFirst="true"
          rules={[
            { required: true, message: "Cần nhập Email" },
            {
              message: "Email không hợp lệ",
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
          <Input placeholder="Email" />
        </Form.Item>
        <Form.Item
          label="Tên"
          name="name"
          rules={[{ required: true, message: "Cần nhập tên" }]}
        >
          <Input placeholder="Tên" />
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
                  value === "" ||
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
          <Input placeholder="Số điện thoại" />
        </Form.Item>
        <Form.Item
          label="Role"
          name="role"
          rules={[{ required: true, message: "Cần chọn vai trò" }]}
        >
          <Select placeholder="Chọn vai trò">
            <Option value="user">Nhân viên sale</Option>
            <Option value="admin">Admin</Option>
          </Select>
        </Form.Item>
        <Form.Item
          label="Mật khẩu"
          name="password"
          validateFirst="true"
          rules={[
            {
              required: true,
              message: "Cần nhập mật khẩu",
            },
            {
              message:
                "Mật khẩu không đủ khỏe (Cần ít nhất 1 chữ hoa, 1 chữ thường, 1 số, 1 ký tự đặc biệt với độ dài từ 8-18)",
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
            placeholder="Nhập mật khẩu"
          />
        </Form.Item>
        <Form.Item
          label="Nhập lại mật khẩu"
          name="confirmPassword"
          rules={[
            {
              required: true,
              message: "Cần nhập lại mật khẩu",
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error("Mật khẩu nhập không trùng khớp")
                );
              },
            }),
          ]}
        >
          <Input.Password
            iconRender={(visible) =>
              visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
            }
            placeholder="Nhập lại mật khẩu"
          />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            style={{ width: "100%" }}
          >
            Tạo
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateForm;
