import { useState } from "react";
import { Modal, Form, Input, Button, Select, message } from "antd";
import api from "@/api/api";
import authErr from "@/api/authErr";
import useLogout from "@/hooks/useLogout";

const { Option } = Select;

const ProdUp = ({ visible, onClose, onSuccess, id }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const { logOut } = useLogout();

  const onFinish = async (values) => {
    setLoading(true);

    try {
      await api.put(`/products/${id}`, {
        ...values,
      });
      form.resetFields();
      if (onSuccess) {
        onSuccess();
      }
      message.success("Product updated");
      onClose();
    } catch (error) {
      console.error(error);
      authErr(error, logOut);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      title="Update Product"
      onCancel={onClose}
      footer={null}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item label="Name" name="name">
          <Input />
        </Form.Item>
        <Form.Item
          label="Price"
          name="price"
          validateFirst="true"
          rules={[
            {
              pattern: /^\d+$/,
              message: "Price must be a number",
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item label="Description" name="description">
          <Input />
        </Form.Item>
        <Form.Item label="Status" name="status">
          <Select placeholder="Select a status">
            <Option value="active">Active</Option>
            <Option value="inactive">Inactive</Option>
            <Option value="delete">Removed</Option>
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
    </Modal>
  );
};

export default ProdUp;
