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
          label="Tên sản phẩm"
          name="prodName"
          validateFirst="true"
          rules={[
            {
              required: true,
              message: "Cần nhập tên sản phẩm",
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Thời hạn mặc định"
          name="length"
          validateFirst="true"
          rules={[
            {
              required: true,
              message: "Cần nhập giá sản phẩm",
            },
            {
              pattern: /^\d+$/,
              message: "Giá tiền phải là số",
            },
          ]}
        >
          <Input addonAfter="tháng" />
        </Form.Item>
        <Form.Item
          label="Giá sản phẩm (đ/tháng)"
          name="price"
          validateFirst="true"
          rules={[
            {
              required: true,
              message: "Cần nhập giá sản phẩm",
            },
            {
              pattern: /^\d+$/,
              message: "Giá tiền phải là số",
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Thông tin sản phẩm"
          name="description"
          rules={[{ required: true, message: "Cần nhập thông tin sảm phẩm" }]}
        >
          <Input.TextArea
            rows={4}
            placeholder="Xin vui lòng điền thông tin của sản phẩm"
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
