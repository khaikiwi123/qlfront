import { useMemo } from "react";
import { MaterialReactTable } from "material-react-table";

export const CustomTable = ({
  data,
  totalCount,
  columns,
  isLoading,
  onColumnFiltersChange,
  paginationProps,
}) => {
  const customColumns = useMemo(() => columns, []);

  return (
    <MaterialReactTable
      columns={customColumns}
      data={data}
      totalCount={totalCount}
      enableFullScreenToggle={false}
      enableHiding={false}
      enableDensityToggle={false}
      localization={{
        noRecordsToDisplay:
          "Hệ thống chưa có dữ liệu theo yêu cầu. Vui lòng bổ sung dữ liệu hoặc thực hiện lại thao tác tìm kiếm",
      }}
      initialState={{
        showGlobalFilter: true,
        density: "compact",
        showColumnFilters: true,
      }}
      enableGlobalFilter={false}
      manualFiltering
      onColumnFiltersChange={onColumnFiltersChange}
      muiTablePaginationProps={paginationProps}
      state={{ isLoading }}
    />
  );
};
