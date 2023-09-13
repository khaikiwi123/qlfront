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
  const [selectedStep, setSelectedStep] = useState(null);
  const [productModal, setProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [popVis, setPop] = useState(false);

  const popoverRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setPop(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const statusToIndex = {
    "No contact": 0,
    "In contact": 1,
    "Verified needs": 2,
    Consulted: 3,
    Success: 4,
  };
  const onChangeStatusStep = async (currentIndex) => {
    const statusKeys = Object.keys(statusToIndex);
    const newStatus = statusKeys[currentIndex];
    setSelectedStep(currentIndex);
    if (currentIndex === statusKeys.length - 1) {
      setPendingStatus(newStatus);
      handlePop();
    } else {
      setIsModalLoading(true);
      try {
        const updateStatus = { status: newStatus, trackStatus: newStatus };

        await api.put(`/leads/${id}`, updateStatus);
        setLead((prevState) => ({
          ...prevState,
          ...updateStatus,
        }));
        fetchChangeLogs();
      } catch (error) {
        console.error(error);
      }
      setIsModalLoading(false);
      setSelectedStep(null);
    }
  };

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

  const clickableWrapper = (content, index) => (
    <span
      onClick={() => (isModalLoading ? null : onChangeStatusStep(index))}
      style={isModalLoading ? { cursor: "not-allowed" } : { cursor: "pointer" }}
    >
      {content}
    </span>
  );

  const currentStep = statusToIndex[trackStatus] || 0;
  const determineStepIcon = (currentIndex) => {
    if (isModalLoading && currentIndex === selectedStep) {
      return <LoadingOutlined />;
    } else if (currentStep === currentIndex) {
      if (status === "Failed") {
        return <CloseCircleOutlined style={{ color: "red" }} />;
      } else {
        return <CheckCircleOutlined style={{ color: "green" }} />;
      }
    }
  };
  const popContent = (
    <>
      <div
        ref={popoverRef}
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
        }}
      >
        {status !== "Failed" && (
          <Button
            key="failed"
            danger
            style={{ flex: 1, marginRight: 10 }}
            onClick={() => handleConfirmChange("Failed")}
            loading={isModalLoading}
          >
            {status === "Success" ? "Đổi sang thất bại" : "Thất bại"}
          </Button>
        )}
        {status === "Success" && (
          <Button
            key="completed"
            type="primary"
            ghost
            style={{ flex: 1 }}
            onClick={() => {
              setProductModal(true);
              setPop(false);
            }}
            loading={isModalLoading}
          >
            Đổi sản phẩm
          </Button>
        )}
        {status !== "Success" && (
          <Button
            key="complete"
            type="primary"
            style={{ flex: 1, background: "green" }}
            onClick={() => {
              setProductModal(true);
              setPop(false);
            }}
            loading={isModalLoading}
          >
            {status === "Failed" ? "Đổi sang thành công" : "Thành công"}
          </Button>
        )}
      </div>
    </>
  );
  const renderContent = (index) => {
    if (index === 4) {
      return (
        <Popover
          content={popContent}
          visible={popVis}
          arrow={false}
          placement="bottom"
        >
          {renderStepContent(index)}
        </Popover>
      );
    }
    return renderStepContent(index);
  };

  const renderStepContent = (index) => (
    <div
      onClick={() => (isModalLoading ? null : onChangeStatusStep(index))}
      style={isModalLoading ? { cursor: "not-allowed" } : { cursor: "pointer" }}
    >
      <span>
        {index === 4
          ? status === "Failed"
            ? "Thất bại"
            : status === "Success"
            ? "Thành công"
            : "Kết thúc"
          : null}
      </span>
    </div>
  );

  const handlePop = () => {
    setPop(!popVis);
    console.log(popVis);
  };

  return (
    <>
      <div>
        <Steps
          labelPlacement="vertical"
          size="small"
          current={currentStep}
          onChange={(currentIndex) => {
            onChangeStatusStep(currentIndex);
          }}
          className={`custom-steps ${
            status === "Failed" ? "failed-steps" : "complete-step"
          }`}
        >
          <Step
            title={
              currentStep === 0
                ? clickableWrapper("Chưa liên hệ", 0)
                : "Chưa liên hệ"
            }
            disabled={isModalLoading}
            icon={
              currentStep === 0
                ? clickableWrapper(determineStepIcon(0), 0)
                : determineStepIcon(0)
            }
          />
          <Step
            title={
              currentStep === 1
                ? clickableWrapper("Đã liên hệ", 1)
                : "Đã liên hệ"
            }
            icon={
              currentStep === 1
                ? clickableWrapper(determineStepIcon(1), 1)
                : determineStepIcon(1)
            }
            disabled={isModalLoading}
          />
          <Step
            title={
              currentStep === 2
                ? clickableWrapper("Đã xác định nhu cầu", 2)
                : "Đã xác định nhu cầu"
            }
            disabled={isModalLoading}
            icon={
              currentStep === 2
                ? clickableWrapper(determineStepIcon(2), 2)
                : determineStepIcon(2)
            }
          />
          <Step
            title={
              currentStep === 3 ? clickableWrapper("Đã tư vấn", 3) : "Đã tư vấn"
            }
            icon={
              currentStep === 3
                ? clickableWrapper(determineStepIcon(3), 3)
                : determineStepIcon(3)
            }
            disabled={isModalLoading}
          />

          <Step
            className="lastStep"
            title={renderContent(4)}
            icon={
              currentStep === 4
                ? clickableWrapper(determineStepIcon(4), 4)
                : determineStepIcon(4)
            }
            disabled={isModalLoading}
          />
        </Steps>
      </div>
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
        {products && products.length > 0 && (
          <Select
            placeholder="Select a product"
            onChange={setSelectedProduct}
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
        )}
      </Modal>
    </>
  );
};

export default AppStep;
