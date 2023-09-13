import { useState } from "react";
import { Modal, Form, Input, Button } from "antd";
import api from "@/api/api";
import { metaErr } from "@/api/metaErr";
import authErr from "@/api/authErr";
import useLogout from "@/hooks/useLogout";

const CreateForm = ({ visible, onClose, roleId, userId, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const { logOut } = useLogout();

  const onFinish = async (values) => {
    setLoading(true);

    try {
      await api.post(`/leads`, {
        ...values,
        createdBy: userId,
        inCharge: roleId === "admin" ? values.inCharge : userId,
      });
      form.resetFields();
      if (onSuccess) {
        onSuccess();
      }

      onClose();
    } catch (error) {
      console.error(error);
      authErr(error, logOut);
      metaErr(error, roleId);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} title="Tạo lead" onCancel={onClose} footer={null}>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Số điện thoại"
          name="phone"
          validateFirst="true"
          rules={[
            {
              required: true,
              message: "Cần nhập số điện thoại",
            },
            {
              message: "Số điện thoại không hợp lệ",
              validator: (_, value) => {
                if (
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
        <Form.Item
          label="Email"
          name="email"
          validateFirst="true"
          rules={[
            { required: true, message: "Cần nhập email" },
            {
              message: "Email không hợp lệ",
              validator: (_, value) => {
                if (/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value)) {
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
        <Form.Item
          label="Tên đơn vị"
          name="org"
          rules={[{ required: true, message: "Cần nhập tên đơn vị" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Người đại diện"
          name="rep"
          rules={[{ required: true, message: "Cần nhập tên người đại diện" }]}
        >
          <Input />
        </Form.Item>

        {roleId === "admin" && (
          <Form.Item
            label="Cấp quyền cho"
            name="inCharge"
            rules={[
              {
                required: true,
                message: "Cần nhập tên người được cấp quyền",
              },
            ]}
          >
            <Input />
          </Form.Item>
        )}
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
