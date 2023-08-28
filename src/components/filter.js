import React, { useState } from "react";
import { useRouter } from "next/router";
import { Button, Select, DatePicker, Input, InputNumber } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const dateFormat = "DD/MM/YYYY";

const FilterModal = ({
  onFilterApply,
  filterOptions,
  queryFilter,
  statusOptions,
}) => {
  const router = useRouter();

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
            placeholder="Select a filter field"
          >
            {filterOptions.map((option) => (
              <Select.Option value={option.value} key={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>

          {filter.selectValue === "lastUp" ? (
            <InputNumber
              style={{ width: 305, marginRight: 10 }}
              value={filter.value || null}
              placeholder="Enter number of days"
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
              placeholder="Select status"
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
              placeholder="Select role"
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
              placeholder="Select a date"
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
          ) : (
            <Input
              style={{ width: 305, marginRight: 10 }}
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

          <PlusOutlined
            style={{ marginRight: 10 }}
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

          {filter.id === Math.max(...filters.map((f) => f.id)) && (
            <>
              <Button onClick={setFilter}>Apply Filters</Button>
              {isAnyFilterSet() && (
                <Button onClick={resetAll} style={{ marginRight: "10px" }}>
                  Clear All Filters
                </Button>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default FilterModal;
