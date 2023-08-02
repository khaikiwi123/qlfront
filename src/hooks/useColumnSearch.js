import { useState, useRef } from "react";
import { Input, Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";

const useColumnSearch = () => {
  const [searchParams, setSearchParams] = useState([]);
  const searchInput = useRef(null);

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
  };
  const handleTableChange = (pagination, filters) => {
    let newSearchParams = [...searchParams]; // keep old filters
    for (let prop in filters) {
      if (filters[prop] && filters[prop].length > 0) {
        const index = newSearchParams.findIndex((o) => o.id === prop);
        if (index === -1) {
          newSearchParams.push({ id: prop, value: filters[prop][0] });
        } else {
          newSearchParams[index].value = filters[prop][0];
        }
      }
    }
    setSearchParams(newSearchParams);
  };
  const getColumnSearchProps = (dataIndex, handleSearch, handleReset) => ({
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
          onClick={() => {
            clearFilters && handleReset(clearFilters, confirm, dataIndex);
          }}
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
    render: (text) => text,
  });

  return {
    searchParams,
    setSearchParams,
    handleSearch,
    handleReset,
    getColumnSearchProps,
    handleTableChange,
  };
};

export default useColumnSearch;
