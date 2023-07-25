import React, { useEffect, useState, useMemo } from "react";
import { MaterialReactTable } from "material-react-table";
import api from "../../api/api";
import Link from "next/link";
import { Button } from "@mui/joy";
import { useRouter } from "next/router";
import useLogout from "../../hooks/useLogout";

const ProtectedPage = () => {
  const [clients, setclients] = useState([]);
  const [verify, setVerify] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState({});
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 1,
  });
  const router = useRouter();

  const { logOut, loading } = useLogout();

  useEffect(() => {
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

    api
      .get("/clients/", {
        params: params,
      })
      .then((res) => {
        setTotal(res.data.total);
        setclients(res.data.clients);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
        setVerify(false);
        console.error(error);
      });
  }, [pagination]);
  const toggleStatus = async (id, currentStatus) => {
    setLoadingStatus({ ...loadingStatus, [id]: true });
    try {
      await api.put(`/clients/${id}`, { status: !currentStatus });
      setclients(
        clients.map((client) =>
          client._id === id ? { ...client, status: !currentStatus } : client
        )
      );
    } catch (error) {
      console.error(error);
    }
    setLoadingStatus({ ...loadingStatus, [id]: false });
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
        accessorKey: "status",
        header: "Status",
        filterVariant: "select",
        filterSelectOptions: [
          { text: "True", value: true },
          { text: "False", value: false },
        ],
        Cell: ({ row: { original } }) => (
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
        ),
        size: 150,
      },
    ],
    [clients, loadingStatus]
  );

  return (
    <>
      {isLoading ? (
        <div>Loading...</div>
      ) : verify ? (
        <div className="App">
          <h2 style={{ textAlign: "left" }}>clients List</h2>
          <MaterialReactTable
            columns={columns}
            data={clients}
            enableFullScreenToggle={false}
            enableHiding={false}
            enableDensityToggle={false}
            enableFacetedValues
            initialState={{
              showGlobalFilter: true,
              density: "compact",
              showColumnFilters: true,
            }}
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
                  pageIndex: 0,
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
