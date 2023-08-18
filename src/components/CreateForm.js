import { useState } from "react";
import { Modal, Form, Input, Button } from "antd";
import Link from "next/link";
import api from "@/api/api";
import { metaErr } from "@/api/metaErr";
import authErr from "@/api/authErr";
import useLogout from "@/hooks/useLogout";

const CreateForm = ({ visible, onClose, roleId, userId, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [emailErr, setEmailErr] = useState("");
  const [phoneErr, setPhoneErr] = useState("");
  const [saleErr, setSaleErr] = useState("");
  const { logOut } = useLogout();

  const onFinish = async (values) => {
    setLoading(true);
    setEmailErr("");
    setPhoneErr("");
    setSaleErr("");

    try {
      await api.post(`/leads`, {
        ...values,
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
      const { emailError, phoneError, saleError } = metaErr(error, roleId);
      setEmailErr(emailError);
      setPhoneErr(phoneError);
      setSaleErr(saleError);
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
          rules={[{ required: true, message: "Please input your email!" }]}
          help={emailErr}
          validateStatus={emailErr ? "error" : ""}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Phone"
          name="phone"
          rules={[
            {
              required: true,
              message: "Please input your phone number!",
            },
          ]}
          help={phoneErr}
          validateStatus={phoneErr ? "error" : ""}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Representative"
          name="rep"
          rules={[{ required: true, message: "Please input your rep!" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Organization"
          name="org"
          rules={[{ required: true, message: "Please input your org!" }]}
        >
          <Input />
        </Form.Item>
        {roleId === "admin" && (
          <Form.Item
            label="Assign to"
            name="inCharge"
            rules={[
              {
                required: true,
                message: "Please input the assigned personel",
              },
            ]}
            help={saleErr}
            validateStatus={saleErr ? "error" : ""}
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
            Create
          </Button>

          <Link href="/leads">
            <Button style={{ width: "100%", marginTop: "10px" }}>
              Back to leads list
            </Button>
          </Link>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateForm;
