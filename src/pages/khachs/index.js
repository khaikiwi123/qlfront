import React, { useEffect, useState, useMemo } from "react";
import { MaterialReactTable } from "material-react-table";
import api from "../../api/api";
import Link from "next/link";
import { Button } from "@mui/joy";
import { useRouter } from "next/router";
import useLogout from "../../hooks/useLogout";

const ProtectedPage = () => {
  const [khachs, setKhachs] = useState([]);
  const [verify, setVerify] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState({});
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
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
    api
      .get("/khachs/")
      .then((res) => {
        setKhachs(res.data);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
        setVerify(false);
        console.error(error);
      });
  }, []);
  const toggleStatus = async (id, currentStatus) => {
    setLoadingStatus({ ...loadingStatus, [id]: true });
    try {
      await api.put(`/khachs/${id}`, { status: !currentStatus });
      setKhachs(
        khachs.map((khach) =>
          khach._id === id ? { ...khach, status: !currentStatus } : khach
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
        accessorKey: "name",
        header: "Name",
        size: 150,
        enableColumnFilter: false,
        Cell: (props) => (
          <Link href={`/khachs/${props.row.original._id}`}>
            <Button
              color="neutral"
              size="sm"
              variant="plain"
              onClick={(e) => {
                e.preventDefault();
                router.push(`/khachs/${props.row.original._id}`);
              }}
            >
              {props.row.original.name}
            </Button>
          </Link>
        ),
      },
      {
        accessorKey: "address",
        header: "Address",
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
    [khachs, loadingStatus]
  );

  return (
    <>
      {isLoading ? (
        <div>Loading...</div>
      ) : verify ? (
        <div className="App">
          <h2 style={{ textAlign: "left" }}>Khachs List</h2>
          <MaterialReactTable
            columns={columns}
            data={khachs}
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
              rowsPerPageOptions: [
                10,
                50,
                { label: "All", value: khachs.length },
              ],
            }}
            onPaginationChange={setPagination}
            state={{ pagination }}
          />
          <Link href="/khachs/create">
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
