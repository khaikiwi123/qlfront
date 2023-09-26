import { useState } from "react";
import { Modal, Form, Input, Button, Select, message } from "antd";
import api from "@/api/api";
import authErr from "@/api/authErr";
import useLogout from "@/hooks/useLogout";
import { metaErr } from "@/api/prodErr";

const { Option } = Select;

const ProdUp = ({ visible, onClose, onSuccess, product }) => {
  const { _id, prodName, description, price, length, status } = product || {};
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const { logOut } = useLogout();

  const onFinish = async (values) => {
    setLoading(true);

    try {
      await api.put(`/products/${_id}`, {
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
  const handleLength = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    form.setFieldsValue({ length: value });
  };
  const handlePrice = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    form.setFieldsValue({ price: value });
  };

  return (
    <Modal
      visible={visible}
      centered
      title="Cập nhập sản phẩm"
      onCancel={onClose}
      footer={null}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          prodName: prodName,
          length: length,
          price: price,
          description: description,
          status: status,
        }}
      >
        <Form.Item label="Tên sản phẩm" name="prodName" required>
          <Input />
        </Form.Item>
        <Form.Item
          label="Thời hạn mặc định"
          name="length"
          validateFirst="true"
          required
          rules={[
            {
              pattern: /^\d+$/,
              message: "Thời gian phải là số",
            },
          ]}
        >
          <Input addonAfter="tháng" onChange={handleLength} />
        </Form.Item>
        <Form.Item
          label="Giá sản phẩm"
          name="price"
          validateFirst="true"
          required
          rules={[
            {
              pattern: /^\d+$/,
              message: "Giá phải là số",
            },
          ]}
        >
          <Input onChange={handlePrice} addonAfter="(đ/tháng)" />
        </Form.Item>
        <Form.Item label="Thông tin sản phẩm" name="description" required>
          <Input.TextArea rows={4} placeholder="Xin vui lòng điền thông tin" />
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
