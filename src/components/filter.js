import React, { useState } from "react";
import { useRouter } from "next/router";
import { Button, Select, DatePicker, Input, InputNumber } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { useUsers } from "@/context/context";
import dayjs from "dayjs";

const dateFormat = "DD/MM/YYYY";

const FilterModal = ({
  onFilterApply,
  filterOptions,
  queryFilter,
  statusOptions,
}) => {
  const router = useRouter();
  const getUnselectedOptions = (currentFilterId) => {
    const selectedValues = filters
      .filter((filter) => filter.id !== currentFilterId)
      .map((filter) => filter.selectValue);
    return filterOptions.filter(
      (option) => !selectedValues.includes(option.value)
    );
  };

  const transformQueryToFilters = (query) => {
    const result = [];
    let id = 1;

    for (const key in query) {
      result.push({
        id: id++,
        value: query[key],
        selectValue: key,
      });
    }

    return result.length ? result : [{ id: 1, value: "", selectValue: "" }];
  };

  const [filters, setFilters] = useState(transformQueryToFilters(queryFilter));
  const { users } = useUsers();

  const setFilter = () => {
    let newFilters = {};

    filters.forEach((filter) => {
      if (filter.selectValue) {
        if (filter.selectValue === "lastUp" && filter.value) {
          const date = dayjs().subtract(filter.value, "day").format(dateFormat);
          newFilters["lastUpdated"] = date;
        } else if (filter.selectValue === "exactDate" && filter.value) {
          newFilters["createdDate"] = filter.value;
        } else if (filter.selectValue === "dateRange" && filter.value) {
          if (filter.value[0]) newFilters["startDate"] = filter.value[0];
          if (filter.value[1]) newFilters["endDate"] = filter.value[1];
        } else if (filter.value) {
          if (newFilters[filter.selectValue]) {
            newFilters[filter.selectValue].push(filter.value);
          } else {
            newFilters[filter.selectValue] = [filter.value];
          }
        }
      }
    });

    onFilterApply(newFilters);
    router.push(router.pathname, undefined, { shallow: true });
  };

  const resetAll = () => {
    setFilters([{ id: 1, value: "", selectValue: "" }]);
    router.push(router.pathname, undefined, { shallow: true });
  };
  const isAnyFilterSet = () => {
    return filters.some(
      (filter) => filter.value || filter.selectValue || filter.id > 1
    );
  };

  return (
    <div style={{ marginBottom: "20px" }}>
      {filters.map((filter) => (
        <div key={filter.id} className="filter-container">
          <Select
            style={{ width: 200, marginRight: 10 }}
            value={filter.selectValue || null}
            allowClear="true"
            onChange={(value) => {
              const updatedFilters = filters.map((f) =>
                f.id === filter.id ? { ...f, selectValue: value, value: "" } : f
              );
              setFilters(updatedFilters);
            }}
            placeholder="Chọn bộ lọc"
          >
            {getUnselectedOptions(filter.id).map((option) => (
              <Select.Option value={option.value} key={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginRight: 10,
            }}
          >
            {filter.selectValue === "lastUp" ? (
              <InputNumber
                style={{ width: 250, marginRight: 10 }}
                value={filter.value || null}
                placeholder="Nhập số ngày"
                min={0}
                onChange={(value) => {
                  const updatedFilters = filters.map((f) =>
                    f.id === filter.id ? { ...f, value } : f
                  );
                  setFilters(updatedFilters);
                }}
              />
            ) : filter.selectValue === "status" ? (
              <Select
                style={{ width: 305, marginRight: 10 }}
                value={filter.value || null}
                placeholder="Lọc trạng thái"
                onChange={(value) => {
                  const updatedFilters = filters.map((f) =>
                    f.id === filter.id ? { ...f, value } : f
                  );
                  setFilters(updatedFilters);
                }}
              >
                {statusOptions.map((option) => (
                  <Select.Option value={option.value} key={option.value}>
                    {option.label}
                  </Select.Option>
                ))}
              </Select>
            ) : filter.selectValue === "role" ? (
              <Select
                style={{ width: 305, marginRight: 10 }}
                value={filter.value || null}
                placeholder="Lọc vai trò"
                onChange={(value) => {
                  const updatedFilters = filters.map((f) =>
                    f.id === filter.id ? { ...f, value } : f
                  );
                  setFilters(updatedFilters);
                }}
              >
                <Select.Option value="admin">Admin</Select.Option>
                <Select.Option value="user">User</Select.Option>
              </Select>
            ) : filter.selectValue === "exactDate" ? (
              <DatePicker
                style={{ width: 305, marginRight: 10 }}
                value={filter.value ? dayjs(filter.value, dateFormat) : null}
                format={dateFormat}
                placeholder="Chọn một ngày"
                onChange={(date, dateString) => {
                  const updatedFilters = filters.map((f) =>
                    f.id === filter.id ? { ...f, value: dateString } : f
                  );
                  setFilters(updatedFilters);
                }}
              />
            ) : filter.selectValue === "dateRange" ? (
              <DatePicker.RangePicker
                style={{ width: 305, marginRight: 10 }}
                allowEmpty={[true, true]}
                format={dateFormat}
                value={[
                  filter.value && filter.value[0]
                    ? dayjs(filter.value[0], dateFormat)
                    : null,
                  filter.value && filter.value[1]
                    ? dayjs(filter.value[1], dateFormat)
                    : null,
                ]}
                onChange={(dates, dateStrings) => {
                  const updatedFilters = filters.map((f) =>
                    f.id === filter.id ? { ...f, value: dateStrings } : f
                  );
                  setFilters(updatedFilters);
                }}
              />
            ) : filter.selectValue === "saleName" ? (
              <Select
                style={{ width: 305, marginRight: 10 }}
                value={filter.value || null}
                placeholder="Chọn người chịu trách nhiệm"
                onChange={(value) => {
                  const updatedFilters = filters.map((f) =>
                    f.id === filter.id ? { ...f, value } : f
                  );
                  setFilters(updatedFilters);
                }}
              >
                {users.map((user) => (
                  <Select.Option value={user.name} key={user.name}>
                    {`${user.name} (${user.email})`}
                  </Select.Option>
                ))}
              </Select>
            ) : (
              <Input
                style={{ width: 305, marginRight: 10 }}
                value={filter.value || null}
                placeholder="Nhập thông tin lọc"
                onChange={(e) => {
                  const updatedFilters = filters.map((f) =>
                    f.id === filter.id ? { ...f, value: e.target.value } : f
                  );
                  setFilters(updatedFilters);
                }}
              />
            )}

            <PlusOutlined
              onClick={() => {
                const newFilter = {
                  id: Math.max(...filters.map((f) => f.id)) + 1,
                  value: "",
                  selectValue: "",
                };
                setFilters([...filters, newFilter]);
              }}
            />

            <DeleteOutlined
              type="delete"
              onClick={() => {
                if (filters.length > 1) {
                  const updatedFilters = filters.filter(
                    (f) => f.id !== filter.id
                  );
                  setFilters(updatedFilters);
                } else {
                  setFilters([{ id: 1, value: "", selectValue: "" }]);
                }
              }}
            />
          </div>

          {filter.id === Math.max(...filters.map((f) => f.id)) && (
            <div
              style={{ display: "flex", alignItems: "baseline", gap: "10px" }}
            >
              <Button className="Apply" onClick={setFilter}>
                Áp dụng bộ lọc
              </Button>
              {isAnyFilterSet() && (
                <Button className="ClearAll" onClick={resetAll}>
                  Xóa toàn bộ bộ lọc
                </Button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default FilterModal;
