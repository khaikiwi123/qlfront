import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";

import { Button, Modal, Steps, Select, Popover, Row, Col } from "antd";
import {
  CloseCircleOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import api from "@/api/api";

const { Step } = Steps;
const { Option } = Select;
const AppStep = ({
  id,
  status,
  trackStatus,
  email,
  setLead,
  fetchChangeLogs,
  products,
  currProd,
}) => {
  const router = useRouter();
  const [pendingStatus, setPendingStatus] = useState("");
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [productModal, setProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [length, setLength] = useState("");
  const [price, setPrice] = useState("");

  const popoverRef = useRef(null);

  useEffect(() => {
    if (length && !isNaN(length)) {
      // Check if length is a valid number
      setPrice((prevPrice) => prevPrice * parseFloat(length));
    }
  }, [length]);
  const handleConfirmChange = async (statusType) => {
    setIsModalLoading(true);

    try {
      let updateStatus;
      if (statusType === "Failed") {
        updateStatus = { status: "Failed", trackStatus: pendingStatus };
      } else if (statusType === "Success") {
        updateStatus = {
          status: pendingStatus,
          trackStatus: pendingStatus,
          product: selectedProduct,
        };
      } else {
        updateStatus = { status: pendingStatus, trackStatus: pendingStatus };
      }

      await api.put(`/leads/${id}`, updateStatus);
      setLead((prevState) => ({
        ...prevState,
        ...updateStatus,
      }));

      if (updateStatus.status === "Success") {
        router.push(`/customers?email=${email}`);
      }
      fetchChangeLogs();
    } catch (error) {
      console.error(error);
    } finally {
      setIsModalLoading(false);
      setProductModal(false);
    }
  };

  const handleProductChange = async () => {
    setIsModalLoading(true);
    try {
      await api.put(`/leads/${id}`, { product: selectedProduct });

      router.push(`/customers?email=${email}`);
      fetchChangeLogs();
    } catch (error) {
      console.error(error);
    } finally {
      setIsModalLoading(false);
      setProductModal(false);
      fetchChangeLogs();
    }
  };

  return (
    <>
      <Modal
        title="Select Product"
        visible={productModal}
        centered
        onCancel={() => setProductModal(false)}
        footer={[
          <Row key="footerRow" style={{ width: "100%" }}>
            <Col span={2}>
              <Button
                key="back"
                onClick={() => setProductModal(false)}
                style={{ marginRight: "auto" }}
              >
                Hủy
              </Button>
            </Col>
            <Col span={22} style={{ textAlign: "right" }}>
              <Button
                key="submit"
                type="primary"
                disabled={!selectedProduct}
                onClick={() => {
                  if (status !== "Success") {
                    handleConfirmChange("Success");
                    setProductModal(false);
                  } else {
                    handleProductChange();
                    setProductModal(false);
                  }
                }}
              >
                Ok
              </Button>
            </Col>
          </Row>,
        ]}
      >
        <Select
          placeholder="Select a product"
          onChange={(value) => {
            const selectedProd = products.find(
              (product) => product.prodName === value
            );
            setSelectedProduct(selectedProd.prodName);
            setLength(selectedProd.length);
            setPrice(selectedProd.price);
          }}
          value={selectedProduct}
          style={{ width: "100%" }}
        >
          {products
            .filter((product) => product.prodName !== currProd)
            .map((product) => (
              <Option key={product.prodName} value={product.prodName}>
                {product.prodName}
              </Option>
            ))}
        </Select>
        <Input
          style={{ marginTop: "1em" }}
          placeholder="Length"
          value={length}
          onChange={(e) => setLength(e.target.value)}
        />
        <Input
          style={{ marginTop: "1em" }}
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
      </Modal>
    </>
  );
};

export default AppStep;
