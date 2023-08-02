import React from "react";
import { Pagination } from "antd";

const UserPagination = ({ total, pagination, setPagination }) => {
  return (
    <Pagination
      current={pagination.pageIndex}
      pageSize={pagination.pageSize}
      total={total}
      pageSizeOptions={["1", "7"]}
      showSizeChanger={true}
      showLessItems={true}
      showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
      onChange={(pageIndex, pageSize) => {
        if (pageSize !== pagination.pageSize) {
          setPagination({ pageIndex: 1, pageSize: pageSize });
        } else {
          setPagination({ ...pagination, pageIndex: pageIndex });
        }
      }}
    />
  );
};

export default UserPagination;
