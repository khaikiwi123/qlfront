import { useState } from "react";
import { Modal, Form, Input, Button, Select, message } from "antd";
import api from "@/api/api";
import authErr from "@/api/authErr";
import useLogout from "@/hooks/useLogout";
import { metaErr } from "@/api/prodErr";

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

  return (
    <Modal
      visible={visible}
      title="Cập nhập sản phẩm"
      onCancel={onClose}
      footer={null}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item label="Tên sản phẩm" name="prodName">
          <Input />
        </Form.Item>
        <Form.Item
          label="Giá sản phẩm"
          name="price"
          validateFirst="true"
          rules={[
            {
              pattern: /^\d+$/,
              message: "Giá phải là số",
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item label="Thông tin sản phẩm" name="description">
          <Input.TextArea rows={4} placeholder="Xin vui lòng điền thông tin" />
        </Form.Item>
        <Form.Item label="Trạng thái" name="status">
          <Select placeholder="Chọn trạng thái">
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
            Cập nhập
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ProdUp;
