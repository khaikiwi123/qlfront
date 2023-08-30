import { useState } from "react";
import { useRouter } from "next/router";

import { Button, Modal, Steps, Row, Col } from "antd";
import {
  CloseCircleOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import api from "@/api/api";

const { Step } = Steps;

const AppStep = ({
  id,
  status,
  trackStatus,
  email,
  setLead,
  fetchChangeLogs,
}) => {
  const router = useRouter();
  const [showModal, setModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState("");
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [selectedStep, setSelectedStep] = useState(null);

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
      setModal(true);
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
      } else {
        updateStatus = { status: pendingStatus, trackStatus: pendingStatus };
      }

      await api.put(`/leads/${id}`, updateStatus);
      setLead((prevState) => ({
        ...prevState,
        ...updateStatus,
      }));

      if (updateStatus.status === "Success") {
        router.push(`/clients?email=${email}`);
      }
      fetchChangeLogs();
    } catch (error) {
      console.error(error);
    }

    setIsModalLoading(false);
    setModal(false);
  };
  const renderStepDescription = (currentIndex) => {
    if (currentStep === currentIndex) {
      if (status === "Failed") {
        return (
          <span
            onClick={() => onChangeStatusStep(currentIndex)}
            style={{ cursor: "pointer", color: "red" }}
          >
            Current
          </span>
        );
      } else {
        return (
          <span
            onClick={() => onChangeStatusStep(currentIndex)}
            style={{ cursor: "pointer", color: "#1890ff" }}
          >
            Current
          </span>
        );
      }
    } else if (currentStep > currentIndex) {
      return <>Completed</>;
    } else {
      return <>Incompleted</>;
    }
  };
  const clickableWrapper = (content, index) => (
    <span
      onClick={() => onChangeStatusStep(index)}
      style={{ cursor: "pointer" }}
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
    return null;
  };

  return (
    <>
      <div className="steps-container">
        <Steps
          type="navigation"
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
            description={renderStepDescription(0)}
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
            description={renderStepDescription(1)}
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
            description={renderStepDescription(2)}
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
            description={renderStepDescription(3)}
            icon={
              currentStep === 3
                ? clickableWrapper(determineStepIcon(3), 3)
                : determineStepIcon(3)
            }
            disabled={isModalLoading}
          />

          <Step
            title={
              status === "Failed"
                ? clickableWrapper("Thất bại", 4)
                : clickableWrapper("Thành công", 4)
            }
            description={renderStepDescription(4)}
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
        title="Result"
        visible={showModal}
        centered
        onCancel={() => {
          setPendingStatus("");
          setModal(false);
        }}
        footer={[
          <Row key="footerRow" style={{ width: "100%" }}>
            <Col span={2}>
              <Button
                key="cancel"
                onClick={() => {
                  setPendingStatus("");
                  setModal(false);
                }}
                loading={isModalLoading}
              >
                Cancel
              </Button>
            </Col>
            <Col span={22} style={{ textAlign: "right" }}>
              {status === "Failed" && (
                <Button
                  key="completed"
                  type="primary"
                  onClick={handleConfirmChange}
                  loading={isModalLoading}
                >
                  Change to Success
                </Button>
              )}
              {status !== "Failed" && (
                <Button
                  key="failed"
                  danger
                  type="primary"
                  onClick={() => handleConfirmChange("Failed")}
                  loading={isModalLoading}
                >
                  Failed
                </Button>
              )}
              {currentStep !== statusToIndex[pendingStatus] && (
                <Button
                  key="complete"
                  type="primary"
                  onClick={handleConfirmChange}
                  loading={isModalLoading}
                >
                  Success
                </Button>
              )}
            </Col>
          </Row>,
        ]}
      >
        <p>Select a result:</p>
      </Modal>
    </>
  );
};

export default AppStep;
