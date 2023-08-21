import React, { useState } from "react";
import { Button, Tooltip, Modal, Select, DatePicker, Input } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
const dateFormat = "DD/MM/YYYY";
const FilterModal = ({ isVisible, onClose, onFilterApply, onResetall }) => {
  const [dateOption, setDateOption] = useState("exactDate");
  const [selectedDates, setSelectedDates] = useState(null);
  const [filters, setFilters] = useState([
    { id: 1, value: "", selectValue: "" },
  ]);

  const setFilter = () => {
    let newFilters = {};

    if (dateOption === "exactDate" && selectedDates) {
      newFilters.createdDate = [selectedDates.format(dateFormat)];
    } else if (dateOption === "dateRange" && selectedDates) {
      const formattedStart =
        selectedDates && selectedDates[0]
          ? selectedDates[0].format(dateFormat)
          : null;
      const formattedEnd =
        selectedDates && selectedDates[1]
          ? selectedDates[1].format(dateFormat)
          : null;
      if (!formattedEnd) {
        newFilters.startDate = formattedStart;
      } else if (!formattedStart) {
        newFilters.endDate = formattedEnd;
      } else {
        newFilters.startDate = formattedStart;
        newFilters.endDate = formattedEnd;
      }
    }

    filters.forEach((filter) => {
      if (filter.selectValue && filter.value) {
        if (newFilters[filter.selectValue]) {
          newFilters[filter.selectValue].push(filter.value);
        } else {
          newFilters[filter.selectValue] = [filter.value];
        }
      }
      if (filter.selectValue === "status" && filter.statusValue) {
        if (newFilters.status) {
          newFilters.status.push(filter.statusValue);
        } else {
          newFilters.status = [filter.statusValue];
        }
      }
    });

    onFilterApply(newFilters);
    onClose();
  };
  const resetAll = () => {
    setFilters([{ id: 1, value: "", selectValue: "" }]);
    setSelectedDates(null);
    onResetall();
  };

  return (
    <Modal
      title={
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Select
            value={dateOption}
            style={{ width: 200 }}
            onChange={(value) => setDateOption(value)}
          >
            <Select.Option value="exactDate">Exact Date</Select.Option>
            <Select.Option value="dateRange">Date Range</Select.Option>
          </Select>

          {dateOption === "exactDate" ? (
            <DatePicker
              value={selectedDates}
              format={dateFormat}
              allowEmpty={[true, true]}
              allowClear={false}
              onChange={(date) => setSelectedDates(date)}
            />
          ) : (
            <DatePicker.RangePicker
              value={selectedDates}
              format={dateFormat}
              allowEmpty={[true, true]}
              allowClear={false}
              onChange={(dates) => setSelectedDates(dates)}
            />
          )}
        </div>
      }
      visible={isVisible}
      onCancel={onClose}
      footer={[
        <Button
          onClick={() => {
            const newFilter = {
              id: Math.max(...filters.map((f) => f.id)) + 1,
              value: "",
              selectValue: "",
            };
            setFilters([...filters, newFilter]);
          }}
        >
          Add Filter
        </Button>,
        <Button onClick={resetAll}>Clear All Filters</Button>,

        <Button key="applyFilter" type="primary" onClick={setFilter}>
          Apply Filters
        </Button>,
      ]}
    >
      <div>
        {filters.map((filter) => (
          <div
            key={filter.id}
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            {filter.selectValue === "status" ? (
              <Select
                style={{ width: 500, marginRight: 10 }}
                value={filter.statusValue || null}
                placeholder="Select Status"
                onChange={(value) => {
                  const updatedFilters = filters.map((f) =>
                    f.id === filter.id ? { ...f, statusValue: value } : f
                  );
                  setFilters(updatedFilters);
                }}
              >
                <Select.Option value="No contact">Chưa Liên Hệ</Select.Option>
                <Select.Option value="In contact">Đã Liên Hệ</Select.Option>
                <Select.Option value="Verified needs">
                  Đã Xác Định Nhu Cầu
                </Select.Option>
                <Select.Option value="Consulted">Đã Tư Vấn</Select.Option>
                <Select.Option value="Success">Thành Công</Select.Option>
              </Select>
            ) : (
              <Input
                style={{ marginRight: 10 }}
                value={filter.value || null}
                placeholder="Enter filter value"
                onChange={(e) => {
                  const updatedFilters = filters.map((f) =>
                    f.id === filter.id ? { ...f, value: e.target.value } : f
                  );
                  setFilters(updatedFilters);
                }}
              />
            )}
            <Select
              style={{ width: 500, marginRight: 10 }}
              value={filter.selectValue || null}
              allowClear="true"
              onChange={(value) => {
                const updatedFilters = filters.map((f) =>
                  f.id === filter.id ? { ...f, selectValue: value } : f
                );
                setFilters(updatedFilters);
              }}
              placeholder="Select a filter field"
            >
              <Select.Option value="phone">Phone</Select.Option>
              <Select.Option value="email">Email</Select.Option>
              <Select.Option value="org">Organization</Select.Option>
              <Select.Option value="rep">Representative</Select.Option>
              <Select.Option value="status">Status</Select.Option>
              <Select.Option value="inCharge">In Charge</Select.Option>
            </Select>
            <DeleteOutlined
              type="delete"
              onClick={() => {
                if (filters.length > 1) {
                  const updatedFilters = filters.filter(
                    (f) => f.id !== filter.id
                  );
                  setFilters(updatedFilters);
                }
              }}
              disabled={filters.length <= 1}
            />
          </div>
        ))}
      </div>
    </Modal>
  );
};

export default FilterModal;
