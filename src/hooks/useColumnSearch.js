import { useState, useRef } from "react";
import { Input, Button, DatePicker, Select } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useRouter } from "next/router";
import dayjs from "dayjs";
const { Option } = Select;

const useColumnSearch = () => {
  const [searchParams, setSearchParams] = useState([]);
  const searchInput = useRef(null);
  const router = useRouter();
  const dateFormat = "DD/MM/YYYY";
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchParams((prevFilters) => {
      const index = prevFilters.findIndex((o) => o.id === dataIndex);
      if (index === -1) {
        return [...prevFilters, { id: dataIndex, value: selectedKeys[0] }];
      }
      prevFilters[index].value = selectedKeys[0];
      return [...prevFilters];
    });
  };

  const handleReset = (clearFilters, confirm, dataIndex) => {
    clearFilters();
    confirm();
    setSearchParams((prevFilters) => {
      const newFilters = prevFilters.filter(
        (filter) => filter.id !== dataIndex
      );
      return newFilters;
    });
    const newQuery = { ...router.query };
    delete newQuery[dataIndex];
    router.push(
      {
        pathname: router.pathname,
        query: newQuery,
      },
      undefined,
      { shallow: true }
    );
  };
  const clearAllFilters = () => {
    setSearchParams([]);
    router.push(router.pathname, undefined, { shallow: true });
  };
  const handleDateSearch = (dates, setSelectedKeys) => {
    if (dates) {
      const formattedStart = dates[0] ? dates[0].format("DD/MM/YYYY") : null;
      const formattedEnd = dates[1] ? dates[1].format("DD/MM/YYYY") : null;
      setSelectedKeys([{ startDate: formattedStart, endDate: formattedEnd }]);
    } else {
      setSelectedKeys([{ startDate: null, endDate: null }]);
    }
  };

  const getColumnDateFilterProps = (dataIndex, handleSearch, handleReset) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }}>
        <DatePicker.RangePicker
          style={{ marginBottom: 8, display: "block" }}
          format={dateFormat}
          allowEmpty={[true, true]}
          allowClear={false}
          onChange={(dates) => handleDateSearch(dates, setSelectedKeys)}
        />
        <Button
          type="primary"
          onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
          icon={<SearchOutlined />}
          size="small"
          style={{ width: 90, marginRight: 10 }}
        >
          Search
        </Button>
        <Button
          onClick={() => handleReset(clearFilters, confirm, dataIndex)}
          size="small"
          style={{ width: 90 }}
        >
          Reset
        </Button>
      </div>
    ),
    onFilter: (value, record) => {
      if (!value || !value.startDate || !value.endDate) return true;
      const startDate = dayjs(value.startDate, "DD/MM/YYYY");
      const endDate = dayjs(value.endDate, "DD/MM/YYYY");
      const createdDate = dayjs(record[dataIndex], "DD/MM/YYYY");
      return createdDate.isAfter(startDate) && createdDate.isBefore(endDate);
    },
  });
  const getColumnSelectFilterProps = (
    dataIndex,
    handleSearch,
    handleReset,
    searchParams
  ) => ({
    filteredValue: searchParams.find((filter) => filter.id === dataIndex)?.value
      ? [searchParams.find((filter) => filter.id === dataIndex).value]
      : null,
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }}>
        <Select
          style={{ width: 188, marginBottom: 8, display: "block" }}
          placeholder="Select Status"
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e !== "" ? [e] : [])}
        >
          <Option value="No contact">Chưa liên hệ</Option>
          <Option value="In contact">Đã liên hệ</Option>
          <Option value="Verified needs">Đã xác định nhu cầu</Option>
          <Option value="Consulted">Đã tư vấn</Option>
          <Option value="Success">Thành công</Option>
        </Select>
        <Button
          type="primary"
          onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
          icon={<SearchOutlined />}
          size="small"
          style={{ width: 90, marginRight: 8 }}
        >
          Search
        </Button>
        <Button
          onClick={() => handleReset(clearFilters, confirm, dataIndex)}
          size="small"
          style={{ width: 90 }}
        >
          Reset
        </Button>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
    ),
    onFilter: (value, record) => record[dataIndex].toString() === value,
  });

  const getColumnSearchProps = (
    dataIndex,
    handleSearch,
    handleReset,
    searchParams
  ) => ({
    filteredValue: searchParams.find((filter) => filter.id === dataIndex)?.value
      ? [searchParams.find((filter) => filter.id === dataIndex).value]
      : null,
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ width: 188, marginBottom: 8, display: "block" }}
        />
        <Button
          type="primary"
          onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
          icon={<SearchOutlined />}
          size="small"
          style={{ width: 90, marginRight: 8 }}
        >
          Search
        </Button>
        <Button
          onClick={() => handleReset(clearFilters, confirm, dataIndex)}
          size="small"
          style={{ width: 90 }}
        >
          Reset
        </Button>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{ color: filtered ? "#1890ff" : undefined, marginRight: "5px" }}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        ? record[dataIndex]
            .toString()
            .toLowerCase()
            .includes(value.toLowerCase())
        : "",
    onFilterDropdownVisibleChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current.select());
      }
    },
  });

  return {
    searchParams,
    setSearchParams,
    handleSearch,
    handleReset,
    getColumnSearchProps,
    setSearchParams,
    clearAllFilters,
    getColumnDateFilterProps,
    getColumnSelectFilterProps,
  };
};

export default useColumnSearch;
