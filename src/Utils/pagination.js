const generatePaginationProps = ({ total, pagination, setPagination }) => ({
  rowsPerPageOptions: [10, 50, "All"],
  count: total,
  page: pagination.pageSize === "All" ? 0 : pagination.pageIndex,
  rowsPerPage: pagination.pageSize === "All" ? total : pagination.pageSize,
  onPageChange: (event, newPage) =>
    setPagination((prev) => ({ ...prev, pageIndex: newPage })),
  onRowsPerPageChange: (event) =>
    setPagination((prev) => ({
      ...prev,
      pageIndex: event.target.value === "All" ? 0 : prev.pageIndex,
      pageSize:
        event.target.value === "All" ? "All" : parseInt(event.target.value, 10),
    })),
  labelDisplayedRows: ({ from, to, count }) =>
    pagination.pageSize === "All"
      ? `${count} of ${count}`
      : `${from}-${to} of ${count}`,
  SelectProps: {
    renderValue: (value) => (value === total ? "All" : value),
  },
});

export default generatePaginationProps;
