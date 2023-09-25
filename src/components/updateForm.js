import { useState } from "react";
import { Modal, Form, Input, Button, message, Select } from "antd";
import api from "@/api/api";
import { metaErr } from "@/api/metaErr";
import authErr from "@/api/authErr";
import useLogout from "@/hooks/useLogout";
import { useUsers } from "@/context/context";

const UpdateForm = ({
  visible,
  onClose,
  roleId,
  userId,
  onSuccess,
  uType,
  customer,
}) => {
  const { email, phone, rep, org, inCharge } = customer;
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const { logOut } = useLogout();
  const { users } = useUsers();
  const onFinish = async (values) => {
    setLoading(true);

    try {
      await api.put(`/${uType}/${userId}`, {
        ...values,
      });
      form.resetFields();
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

  const handleNumber = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    form.setFieldsValue({ phone: value });
  };

  return (
    <Modal
      visible={visible}
      title="Cập nhập Lead"
      onCancel={onClose}
      footer={null}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          email: email,
          phone: phone,
          rep: rep,
          org: org,
          inCharge: inCharge,
        }}
      >
        <Form.Item
          label="Email"
          name="email"
          validateFirst="true"
          rules={[
            {
              message: "Email không hợp lệ",
              validator: (_, value) => {
                if (!value || /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value)) {
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
          <Input onChange={handleNumber} />
        </Form.Item>

        <Form.Item label="Người đại diện" name="rep">
          <Input />
        </Form.Item>
        <Form.Item label="Tổ chức" name="org">
          <Input />
        </Form.Item>
        {roleId === "admin" && (
          <Form.Item label="Cấp quyền cho" name="inCharge">
            <Select
              placeholder="Chọn người phụ trách"
              onChange={(value) => form.setFieldsValue({ inCharge: value })}
            >
              {users.map((user) => (
                <Select.Option value={user.email} key={user.email}>
                  {user.email}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        )}
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
    </Modal>
  );
};

export default UpdateForm;
