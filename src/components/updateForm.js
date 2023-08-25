import { useState } from "react";
import { Modal, Form, Input, Button } from "antd";
import api from "@/api/api";
import { metaErr } from "@/api/metaErr";
import authErr from "@/api/authErr";
import useLogout from "@/hooks/useLogout";

const UpdateForm = ({ visible, onClose, roleId, userId, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const { logOut } = useLogout();

  const onFinish = async (values) => {
    setLoading(true);

    try {
      await api.put(`/leads/${userId}`, {
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
      <Form form={form} layout="vertical" onFinish={onFinish} hideRequiredMark>
        <Form.Item
          label="Email"
          name="email"
          validateFirst="true"
          rules={[
            {
              message: "Email isn't valid",
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
          label="Phone"
          name="phone"
          validateFirst="true"
          rules={[
            {
              message: "Phone number isn't valid",
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
          <Input />
        </Form.Item>

        <Form.Item label="Representative" name="rep">
          <Input />
        </Form.Item>
        <Form.Item label="Organization" name="org">
          <Input />
        </Form.Item>
        {roleId === "admin" && (
          <Form.Item label="Assign to" name="inCharge">
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
            Update
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UpdateForm;
