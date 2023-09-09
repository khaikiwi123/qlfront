import { useState } from "react";
import { Modal, Form, Input, Button } from "antd";
import api from "@/api/api";
import authErr from "@/api/authErr";
import useLogout from "@/hooks/useLogout";
import { metaErr } from "@/api/prodErr";

const CreateForm = ({ visible, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const { logOut } = useLogout();

  const onFinish = async (values) => {
    setLoading(true);

    try {
      await api.post(`/products`, {
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
      title="Create Product"
      onCancel={onClose}
      footer={null}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Name"
          name="prodName"
          validateFirst="true"
          rules={[
            {
              required: true,
              message: "Name is required",
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Price"
          name="price"
          validateFirst="true"
          rules={[
            {
              required: true,
              message: "A price is required",
            },
            {
              pattern: /^\d+$/,
              message: "Price must be a number",
            },
            {
              validator: (_, value) => {
                if (value && parseFloat(value) > 1000) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error("Price must be greater than 1000")
                );
              },
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: "A description is required" }]}
        >
          <Input.TextArea rows={4} placeholder="Please enter description" />
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
