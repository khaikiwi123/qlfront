import api from "../../api/api";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@mui/joy";
import Router from "next/router";
import { MaterialReactTable } from "material-react-table";
import useLogout from "../../hooks/useLogout";

const ProtectedPage = () => {
  const [users, setUsers] = useState([]);
  const [verify, setVerify] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [currID, setCurr] = useState("");
  const [loadingStatus, setLoadingStatus] = useState({});
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const { logOut, loading } = useLogout();
  useEffect(() => {
    setCurr(localStorage.getItem("currID"));
    localStorage.removeItem("ID");
  }, []);
  useEffect(() => {
    setIsLoading(true);
    const loggedin = localStorage.getItem("logged_in");
    if (loggedin !== "true") {
      Router.push("/login");
      return;
    }
    api
      .get("/users/")
      .then((res) => {
        const sortedUsers = res.data.sort((a, b) => {
          const aNameParts = a.name.split(" ");
          const bNameParts = b.name.split(" ");

          const aLast = aNameParts[0];
          const aFirst = aNameParts[aNameParts.length - 1];
          const aMiddle = aNameParts.slice(1, -1).join(" ");

          const bLast = bNameParts[0];
          const bFirst = bNameParts[bNameParts.length - 1];
          const bMiddle = bNameParts.slice(1, -1).join(" ");

          if (aFirst < bFirst) return -1;
          if (aFirst > bFirst) return 1;

          if (aLast < bLast) return -1;
          if (aLast > bLast) return 1;

          if (aMiddle < bMiddle) return -1;
          if (aMiddle > bMiddle) return 1;

          return 0;
        });

        setUsers(sortedUsers);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
        setVerify(false);
        console.error(error);
      });
  }, []);

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "2-digit", day: "2-digit" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  const toggleStatus = async (id, currentStatus) => {
    setLoadingStatus({ ...loadingStatus, [id]: true });
    try {
      await api.put(`/users/${id}`, { status: !currentStatus });
      setUsers(
        users.map((user) =>
          user._id === id ? { ...user, status: !currentStatus } : user
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
          <Link href={`/users/${props.row.original._id}`}>
            <Button
              color="neutral"
              size="sm"
              variant="plain"
              onClick={(e) => {
                e.preventDefault();
                Router.push(`/users/${props.row.original._id}`);
              }}
            >
              {props.row.original.email}
            </Button>
          </Link>
        ),
      },
      {
        accessorKey: "name",
        header: "Name",
        size: 200,
        enableColumnFilter: false,
      },
      {
        accessorKey: "role",
        header: "Role",
        filterVariant: "select",
        size: 200,
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
          { text: "Active", value: true },
          { text: "Inactive", value: false },
        ],
        Cell: ({ row: { original } }) => (
          <button
            onClick={() => toggleStatus(original._id, original.status)}
            disabled={loadingStatus[original._id] || original._id === currID}
            title={
              original._id === currID ? "Can't deactivate current user" : ""
            }
          >
            {loadingStatus[original._id]
              ? "Loading..."
              : original.status
              ? "Active"
              : "Inactive"}
          </button>
        ),
        size: 150,
      },
    ],
    [users, loadingStatus]
  );
  return (
    <>
      {isLoading ? (
        <div>Loading...</div>
      ) : verify ? (
        <div className="App">
          <h2 style={{ textAlign: "left" }}>Users List</h2>
          <MaterialReactTable
            columns={columns}
            data={users}
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
                { label: "All", value: users.length },
              ],
            }}
            onPaginationChange={setPagination}
            state={{ pagination }}
          />
          <Link href="/users/create">
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
          <h1>NOT AUTHORIZED</h1>
          <p>Please log in with another account or go back to home</p>
          <Link href="/home">
            <button>Home</button>
          </Link>
          <button disabled={loading} onClick={logOut}>
            {loading ? "Logging out..." : "Log out"}
          </button>
        </div>
      )}
    </>
  );
};

export default ProtectedPage;
