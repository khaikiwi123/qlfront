import React from "react";
import { Table } from "antd";
import UserFilters from "./UserFilters";

const UserTable = ({
  handleTableChange,
  data,
  loading,
  pagination,
  searchParams,
  handleSearch,
  handleReset,
  searchText,
  searchedColumn,
}) => {
  const columns = [
    // rest of your columns
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      ...UserFilters({ handleReset, handleSearch, searchedColumn, searchText }),
    },
    // rest of your columns
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      loading={loading}
      rowKey="email"
      onChange={handleTableChange}
      pagination={pagination}
    />
  );
};

export default UserTable;
