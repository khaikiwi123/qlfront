import React, { useEffect, useState, useMemo, useRef } from "react";
import { MaterialReactTable } from "material-react-table";
import api from "../../api/api";
import Link from "next/link";
import { Button } from "@mui/joy";
import { useRouter } from "next/router";
import useLogout from "../../hooks/useLogout";

const ProtectedPage = () => {
  const [clients, setclients] = useState([]);
  const [verify, setVerify] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState({});
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 1,
  });
  const [columnFilters, setColumnFilters] = useState([]);
  const isUpdatingStatus = useRef(false);

  const router = useRouter();
  const { logOut, loading } = useLogout();

  useEffect(() => {
    if (isUpdatingStatus.current) {
      isUpdatingStatus.current = false;
      return;
    }
    setIsLoading(true);
    const loggedin = localStorage.getItem("logged_in");
    if (loggedin !== "true") {
      router.push("/login");
      return;
    }
    const { pageIndex, pageSize } = pagination;
    let params = {};
    if (pageSize !== "All") {
      params = {
        pageNumber: pageIndex + 1,
        pageSize: pageSize,
      };
    }

    const transformedFilters = columnFilters.reduce((acc, filter) => {
      if (filter.value !== "all") {
        acc[filter.id] = filter.value;
      }
      return acc;
    }, {});

    params = {
      ...params,
      ...transformedFilters,
    };

    api
      .get("/clients/", { params })
      .then((res) => {
        setTotal(res.data.total);
        setclients(res.data.clients);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
        if (error.response && error.response.status === 401) {
          setVerify(false);
        }
        console.error(error);
      });
  }, [pagination, columnFilters]);

  const toggleStatus = async (id, currentStatus) => {
    setLoadingStatus((prevState) => ({ ...prevState, [id]: true }));

    try {
      await api.put(`/clients/${id}`, { status: !currentStatus });
      setclients((prevClients) =>
        prevClients.map((client) =>
          client._id === id ? { ...client, status: !currentStatus } : client
        )
      );
    } catch (error) {
      console.error(error);
    }

    setLoadingStatus((prevState) => ({ ...prevState, [id]: false }));
  };
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "2-digit", day: "2-digit" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "email",
        header: "Email",
        size: 150,
        enableColumnFilter: false,
        Cell: (props) => (
          <Link href={`/clients/${props.row.original._id}`}>
            <Button
              color="neutral"
              size="sm"
              variant="plain"
              onClick={(e) => {
                e.preventDefault();
                router.push(`/clients/${props.row.original._id}`);
              }}
            >
              {props.row.original.email}
            </Button>
          </Link>
        ),
      },
      {
        accessorKey: "unit",
        header: "Unit",
        size: 200,
        enableColumnFilter: false,
      },
      {
        accessorKey: "represent",
        header: "Representer",
        size: 200,
        enableColumnFilter: false,
      },
      {
        accessorKey: "phone",
        header: "Phone",
        enableColumnFilter: false,
        size: 150,
      },
      {
        accessorKey: "createdDate",
        header: "Created",
        size: 150,
        Cell: (props) => formatDate(props.row.original.createdDate),
        enableColumnFilter: false,
      },
      {
        accessorKey: "status",
        header: "Status",
        filterVariant: "select",
        filterSelectOptions: [
          { text: "All", value: "all" },
          { text: "True", value: "true" },
          { text: "False", value: "false" },
        ],
        Cell: ({ row: { original } }) => (
          <div>
            <button
              onClick={() => toggleStatus(original._id, original.status)}
              disabled={loadingStatus[original._id]}
            >
              {loadingStatus[original._id]
                ? "Loading..."
                : original.status
                ? "True"
                : "False"}
            </button>
          </div>
        ),
        size: 150,
      },
    ],
    [loadingStatus]
  );

  return (
    <>
      {verify ? (
        <div className="App">
          <h2 style={{ textAlign: "left" }}>clients List</h2>
          <MaterialReactTable
            columns={columns}
            data={clients}
            enableFullScreenToggle={false}
            enableHiding={false}
            enableDensityToggle={false}
            initialState={{
              showGlobalFilter: true,
              density: "compact",
              showColumnFilters: true,
            }}
            manualFiltering
            onColumnFiltersChange={setColumnFilters}
            muiTablePaginationProps={{
              rowsPerPageOptions: [1, 2, "All"],
              count: total,
              page: pagination.pageSize === "All" ? 0 : pagination.pageIndex,
              rowsPerPage:
                pagination.pageSize === "All" ? total : pagination.pageSize,
              onPageChange: (event, newPage) =>
                setPagination((prev) => ({ ...prev, pageIndex: newPage })),
              onRowsPerPageChange: (event) =>
                setPagination((prev) => ({
                  ...prev,
                  pageIndex: event.target.value === "All" ? 0 : prev.pageIndex,
                  pageSize:
                    event.target.value === "All"
                      ? "All"
                      : parseInt(event.target.value, 10),
                })),
              labelDisplayedRows: ({ from, to, count }) =>
                pagination.pageSize === "All"
                  ? `${count} of ${count}`
                  : `${from}-${to} of ${count}`,
              SelectProps: {
                renderValue: (value) => (value === total ? "All" : value),
              },
            }}
            state={{ isLoading }}
          />
          <Link href="/clients/create">
            <button>Create</button>
          </Link>
          <Link href="/home">
            <button>Home</button>
          </Link>
          <button disabled={loading} onClick={logOut}>
            {loading ? "Logging out..." : "Log out"}
          </button>
        </div>
      ) : (
        <div>
          <h1>SESSION EXPIRED</h1>
          <p>Please log back in</p>
          <button disabled={loading} onClick={logOut}>
            {loading ? "Logging out..." : "Log out"}
          </button>
        </div>
      )}
    </>
  );
};

export default ProtectedPage;
