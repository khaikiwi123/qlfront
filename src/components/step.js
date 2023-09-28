import { useState, useRef, useEffect } from "react";

import { Button, Steps, Popover, Form, Modal, Input, Row, Col } from "antd";
import {
  CloseCircleOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import api from "@/api/api";
import BillForm from "./billForm";
import { translateStatus } from "@/Utils/translate";

const { Step } = Steps;
const AppStep = ({
  id,
  role,
  status,
  trackStatus,
  org,
  sale,
  saleName,
  currUser,
  currName,
  setLead,
  fetchChangeLogs,
  products,
  phone,
  setOk,
}) => {
  const [form] = Form.useForm();
  const [pendingStatus, setPendingStatus] = useState("");
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [noteLoading, setNoteLoad] = useState(false);
  const [selectedStep, setSelectedStep] = useState(null);
  const [productModal, setProductModal] = useState(false);
  const [noteModal, setNoteModal] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [note, setNote] = useState(null);
  const [popVis, setPop] = useState(false);
  const [actionType, setActionType] = useState(null);

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

  const onChangeStatusStep = (currentIndex) => {
    const statusKeys = Object.keys(statusToIndex);
    const newStatus = statusKeys[currentIndex];
    setSelectedStep(currentIndex);

    if (currentIndex === statusKeys.length - 1) {
      setPendingStatus(newStatus);
      handlePop();
    } else if (currentIndex === currentStep) {
      console.log("current");
      setConfirm(true);
    } else {
      setActionType("updateStatus");
      setNoteModal(true);
    }
  };
  const handleOk = async () => {
    setNoteLoad(true);
    setIsModalLoading(true);
    try {
      let updateStatus;

      if (actionType === "updateStatus") {
        const statusKeys = Object.keys(statusToIndex);
        const newStatus = statusKeys[selectedStep];
        updateStatus = { status: newStatus, trackStatus: newStatus };
      } else if (actionType === "failed") {
        updateStatus = { status: "Failed", trackStatus: pendingStatus };
      }

      if (note) {
        updateStatus.note = note;
      }

      await api.put(`/leads/${id}`, updateStatus);
      setLead((prevState) => ({ ...prevState, ...updateStatus }));
      fetchChangeLogs();
      form.resetFields();
    } catch (error) {
      console.error(error);
    } finally {
      setIsModalLoading(false);
      setNoteModal(false);
      setNote(null);
      setActionType(null);
      setNoteLoad(false);
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
  const handleFailed = () => {
    setActionType("failed");
    setNoteModal(true);
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
            onClick={handleFailed}
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
      <BillForm
        role={role}
        org={org}
        sale={sale}
        sName={saleName}
        currUser={currUser}
        products={products}
        phone={phone}
        setOk={setOk}
        id={id}
        currName={currName}
        status={status}
        isModalLoading={isModalLoading}
        setIsModalLoading={setIsModalLoading}
        productModal={productModal}
        setProductModal={setProductModal}
        pendingStatus={pendingStatus}
        setLead={setLead}
        fetchChangeLogs={fetchChangeLogs}
      />
      <Modal
        title="Ghi chú"
        footer={null}
        visible={noteModal}
        centered
        onCancel={() => {
          setNoteModal(false);
          setNote("");
          form.resetFields();
        }}
      >
        <Form form={form}>
          <Form.Item name="note">
            <Input.TextArea
              placeholder="Bạn nó muốn viết ghi chú không?"
              rows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            ></Input.TextArea>
          </Form.Item>

          <Row justify="space-between">
            <Col>
              <Button
                onClick={() => {
                  setNoteModal(false);
                  form.resetFields();
                }}
                loading={noteLoading}
              >
                Cancel
              </Button>
            </Col>
            <Col>
              <Button type="primary" loading={noteLoading} onClick={handleOk}>
                Ok
              </Button>
            </Col>
          </Row>
        </Form>
      </Modal>
      <Modal
        visible={confirm}
        centered
        title="Xác nhận"
        onCancel={() => setConfirm(false)}
        footer={
          <Row justify="space-between">
            <Col>
              <Button onClick={() => setConfirm(false)}>Cancel</Button>
            </Col>
            <Col>
              <Button
                type="primary"
                onClick={() => {
                  setConfirm(false);
                  setActionType("updateStatus");
                  setNoteModal(true);
                }}
              >
                Ok
              </Button>
            </Col>
          </Row>
        }
      >
        Bạn có chắc muốn cập nhật trạng thái {translateStatus(status)} một lần
        nữa không?
      </Modal>
    </>
  );
};

export default AppStep;
