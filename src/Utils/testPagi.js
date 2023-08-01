const generateAntPaginationProps = ({ total, pagination, setPagination }) => ({
    pageSizeOptions: ['10', '50', 'All'],
    total: total,
    current: pagination.pageSize === "All" ? 0 : pagination.pageIndex + 1, // Ant Design uses 1-indexing for pages
    pageSize: pagination.pageSize === "All" ? total : pagination.pageSize,
    onChange: (page, pageSize) =>
      setPagination((prev) => ({ ...prev, pageIndex: page - 1, pageSize })), // subtract 1 because Ant Design uses 1-indexing for pages
    showSizeChanger: true,
    onShowSizeChange: (current, size) =>
      setPagination((prev) => ({
        ...prev,
        pageIndex: size === "All" ? 0 : prev.pageIndex,
        pageSize: size === "All" ? "All" : parseInt(size, 10),
      })),
    showTotal: (total, range) =>
      pagination.pageSize === "All"
        ? `${total} of ${total}`
        : `${range[0]}-${range[1]} of ${total}`,
  });
  
  export default generateAntPaginationProps;
  