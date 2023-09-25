import { useState, useEffect } from "react";

import {
  Button,
  Modal,
  Select,
  Row,
  Col,
  Input,
  DatePicker,
  Form,
  message,
  Tooltip,
} from "antd";
import api from "@/api/api";
import dayjs from "dayjs";

import { useUsers } from "@/context/context";

const dateFormat = "DD/MM/YYYY";
const { RangePicker } = DatePicker;
const { Option } = Select;
const BillForm = ({
  productModal,
  pendingStatus,
  setIsModalLoading,
  setProductModal,
  id,
  role,
  status,
  org,
  sale,
  currUser,
  setLead,
  fetchChangeLogs,
  products,
  phone,
  setOk,
}) => {
  const [inCharge, setInCharge] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [defaultPrice, setDefault] = useState("");
  const [selectedDates, setSelectedDates] = useState([null, null]);
  const [length, setLength] = useState("");
  const [price, setPrice] = useState("");

  const { users } = useUsers();
  useEffect(() => {
    if (length && !isNaN(length) && defaultPrice) {
      const newPrice = defaultPrice * parseFloat(length);
      setPrice(newPrice);
    }
  }, [length, defaultPrice]);
  useEffect(() => {
    if (length && !isNaN(length) && selectedProduct) {
      const startDate = selectedDates[0] || dayjs();
      const endDate = computeEndDate(startDate, length);
      setSelectedDates([startDate, endDate]);
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

      fetchChangeLogs();
      resetForm();
      setOk((prev) => !prev);
    } catch (error) {
      console.error(error);
    } finally {
      setIsModalLoading(false);
      setProductModal(false);
    }
  };

  const handleBill = async () => {
    setIsModalLoading(true);
    try {
      const billData = {
        customer: phone,
        org: org,
        product: selectedProduct,
        length: length.toString(),
        price: price.toString(),
        startDate: selectedDates[0],
        inCharge: role === "admin" ? inCharge : currUser,
        status: "Active",
      };
      await api.post("bills", billData);
      return true;
    } catch (error) {
      if (error.response.data.error === "Sale user doesn't exist") {
        message.error("Người dùng không tồn tại", 2);
      } else {
        message.error("Lỗi tạo bill");
      }
      return false;
    } finally {
      setIsModalLoading(false);
      setProductModal(false);
    }
  };

  const handleProductChange = async () => {
    setIsModalLoading(true);
    try {
      await api.put(`/leads/${id}`, { product: selectedProduct });
      fetchChangeLogs();
      resetForm();
      setOk((prev) => !prev);
    } catch (error) {
      console.error(error);
    } finally {
      setIsModalLoading(false);
      setProductModal(false);
    }
  };
  const combinedFunction = async (statusType) => {
    const billingSuccess = await handleBill();
    if (billingSuccess) {
      await handleConfirmChange(statusType);
    }
  };
  const combinedProduct = async () => {
    const billingSuccess = await handleBill();
    if (billingSuccess) {
      await handleProductChange();
    }
  };

  const computeEndDate = (date, length) => {
    if (date && length) {
      return dayjs(date).add(30 * parseFloat(length), "days");
    }
    return null;
  };
  const handleOk = () => {
    if (status !== "Success") {
      combinedFunction("Success");
      setProductModal(false);
    } else {
      combinedProduct();
      setProductModal(false);
    }
  };
  const resetForm = () => {
    setSelectedProduct(null);
    setLength(null);
    setPrice(null);
    setDefault(null);
    setSelectedDates([null, null]);
    setInCharge(null);
  };
  const isButtonDisabled =
    !selectedProduct || !inCharge || !price || !selectedDates || !length;

  return (
    <>
      <Modal
        title="Select Product"
        visible={productModal}
        centered
        onCancel={() => {
          setProductModal(false);
          resetForm();
        }}
        footer={null}
      >
        <Form
          labelCol={{
            span: 6,
          }}
          wrapperCol={{
            span: 18,
          }}
          labelAlign="left"
          onFinish={handleOk}
        >
          <Form.Item label="Sản phẩm" required>
            <Select
              placeholder="Chọn sản phẩm"
              onChange={(value) => {
                const selectedProd = products.find(
                  (product) => product.prodName === value
                );
                setSelectedProduct(selectedProd.prodName);
                setLength(selectedProd.length);
                setPrice(selectedProd.price);
                setDefault(selectedProd.price);
                setInCharge(sale);
                const startDate = dayjs();
                const endDate = computeEndDate(startDate, selectedProd.length);

                setSelectedDates([startDate, endDate]);
              }}
              value={selectedProduct}
            >
              {products
                .filter((product) => product.status === "active")
                .map((product) => (
                  <Option key={product.prodName} value={product.prodName}>
                    {product.prodName}
                  </Option>
                ))}
            </Select>
          </Form.Item>

          <Form.Item label="Thời hạn" required>
            <Input
              placeholder="Thời hạn"
              value={length}
              addonAfter="tháng"
              onChange={(e) => {
                if (!isNaN(e.target.value) && e.target.value.trim() !== "") {
                  setLength(e.target.value.trim());
                } else if (e.target.value.trim() === "") {
                  setLength("");
                }
              }}
            />
          </Form.Item>

          <Form.Item label="Giá sản phẩm" required>
            <Input
              placeholder="Giá sản phẩm"
              value={price}
              addonAfter="(₫)"
              onChange={(e) => {
                if (!isNaN(e.target.value) && e.target.value.trim() !== "") {
                  setPrice(e.target.value.trim());
                } else if (e.target.value.trim() === "") {
                  setPrice("");
                }
              }}
            />
          </Form.Item>

          <Form.Item label="Thời gian" required>
            <RangePicker
              format={dateFormat}
              style={{ width: "100%" }}
              onCalendarChange={(dates) => {
                if (dates && dates.length > 0 && dates[0]) {
                  setSelectedDates([
                    dayjs(dates[0]),
                    dayjs(computeEndDate(dates[0], length)),
                  ]);
                } else {
                  setSelectedDates([null, null]);
                }
              }}
              value={selectedDates}
              placeholder={["Ngày bắt đầu", "Ngày kết thúc"]}
            />
          </Form.Item>
          {role === "admin" && (
            <Form.Item label="Cấp quyền cho" required>
              <Select
                style={{ width: "100%" }}
                placeholder="Chọn người phụ trách"
                onChange={(value) => setInCharge(value)}
                value={inCharge}
              >
                {users.map((user) => (
                  <Select.Option value={user.email} key={user.email}>
                    {user.email}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}
          <Row justify="space-between">
            <Col>
              <Button
                onClick={() => {
                  setProductModal(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
            </Col>
            <Col>
              <Tooltip
                title={isButtonDisabled ? "All fields are required" : ""}
              >
                <span>
                  <Button
                    type="primary"
                    htmlType="submit"
                    disabled={isButtonDisabled}
                  >
                    OK
                  </Button>
                </span>
              </Tooltip>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
};

export default BillForm;
