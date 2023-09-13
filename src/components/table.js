import React from "react";
import { Table } from "antd";

const UserTable = ({
  columns,
  data,
  total,
  loading,
  pagination,
  handleTableChange,
  setPagination,
}) => (
  <Table
    columns={columns}
    dataSource={data}
    loading={loading}
    rowKey="email"
    onChange={handleTableChange}
    pagination={{
      total: total,
      current: pagination.pageIndex,
      pageSize: pagination.pageSize,
      pageSizeOptions: ["10", "50"],
      showSizeChanger: true,
      showLessItems: true,
      showTotal: (total, range) =>
        `Hiển thị ${range[0]}-${range[1]} trên ${total}`,
      onChange: (pageIndex, pageSize) => {
        if (pageSize !== pagination.pageSize) {
          setPagination({
            pageIndex: 1,
            pageSize: pageSize,
          });
        } else {
          setPagination({
            ...pagination,
            pageIndex: pageIndex,
          });
        }
      },
    }}
    scroll={{
      x: 1000,
      y: 335,
    }}
  />
);

export default UserTable;
