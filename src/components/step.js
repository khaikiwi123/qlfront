import { useState } from "react";
import { useRouter } from "next/router";

import { Button, Popconfirm, Modal, Steps } from "antd";
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

  const onDelete = async (id) => {
    await api.delete(`/leads/${id}`);

    router.push("/leads");
  };

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
            Action
          </span>
        );
      } else {
        return (
          <span
            onClick={() => onChangeStatusStep(currentIndex)}
            style={{ cursor: "pointer", color: "#1890ff" }}
          >
            Action
          </span>
        );
      }
    } else if (currentStep > currentIndex) {
      return <>Completed</>;
    } else {
      return <>Incompleted</>;
    }
  };

  const currentStep = statusToIndex[trackStatus] || 0;
  // const shouldAllowStepChange = (currentIndex) => {
  // if (currentIndex < currentStep) {
  //   return false;
  // }
  //   return status !== "Success" && status !== "Failed";
  // };
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
            title={"Chưa liên hệ"}
            description={renderStepDescription(0)}
            disabled={isModalLoading}
            icon={determineStepIcon(0)}
          />
          <Step
            title={"Đã liên hệ"}
            description={renderStepDescription(1)}
            icon={determineStepIcon(1)}
            disabled={isModalLoading}
          />
          <Step
            title={"Đã xác định nhu cầu"}
            description={renderStepDescription(2)}
            icon={determineStepIcon(2)}
            disabled={isModalLoading}
          />
          <Step
            title={"Đã tư vấn"}
            description={renderStepDescription(3)}
            icon={determineStepIcon(3)}
            disabled={isModalLoading}
          />
          <Step
            title={status === "Failed" ? "Thất bại" : "Thành công"}
            description={renderStepDescription(4)}
            icon={determineStepIcon(4)}
            disabled={isModalLoading}
          />
        </Steps>
      </div>
      <Modal
        title="Result"
        visible={showModal}
        onCancel={() => {
          setPendingStatus("");
          setModal(false);
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setPendingStatus("");
              setModal(false);
            }}
            loading={isModalLoading}
          >
            Cancel
          </Button>,
          status === "Failed" && (
            <Popconfirm
              title="Are you sure to delete this lead?"
              onConfirm={() => onDelete(id)}
              onCancel={null}
              okText="Yes"
              cancelText="No"
            >
              <Button key="delete" type="primary" danger>
                Delete
              </Button>
            </Popconfirm>
          ),
          status === "Failed" && (
            <Button
              key="completed"
              type="primary"
              onClick={handleConfirmChange}
              loading={isModalLoading}
            >
              Change to Success
            </Button>
          ),
          status !== "Failed" && (
            <Button
              key="failed"
              danger
              type="primary"
              onClick={() => handleConfirmChange("Failed")}
              loading={isModalLoading}
            >
              Failed
            </Button>
          ),
        ]}
      >
        <p>Select a result:</p>
      </Modal>
    </>
  );
};

export default AppStep;
