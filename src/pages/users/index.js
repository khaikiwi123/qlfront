import api from "../../api/api";
import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import { Button } from "@mui/joy";
import Router from "next/router";
import { CustomTable } from "@/Utils/table";
import useLogout from "../../hooks/useLogout";
import generatePaginationProps from "@/Utils/pagination";

const ProtectedPage = () => {
  const [users, setUsers] = useState([]);
  const [verify, setVerify] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [currID, setCurr] = useState("");
  const [loadingStatus, setLoadingStatus] = useState({});
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [columnFilters, setColumnFilters] = useState([]);
  const isUpdatingStatus = useRef(false);

  const { logOut, loading } = useLogout();

  useEffect(() => {
    setCurr(localStorage.getItem("currID"));
  }, []);

  useEffect(() => {
    if (isUpdatingStatus.current) {
      isUpdatingStatus.current = false;
      return;
    }
    setIsLoading(true);
    const loggedin = localStorage.getItem("logged_in");
    if (loggedin !== "true") {
      Router.push("/login");
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
      .get("/users/", { params })
      .then((res) => {
        setTotal(res.data.total);
        setUsers(res.data.users);
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

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "2-digit", day: "2-digit" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const toggleStatus = async (id, currentStatus) => {
    setLoadingStatus((prevState) => ({ ...prevState, [id]: true }));

    try {
      await api.put(`/users/${id}`, { status: !currentStatus });
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === id ? { ...user, status: !currentStatus } : user
        )
      );
    } catch (error) {
      console.error(error);
    }

    setLoadingStatus((prevState) => ({ ...prevState, [id]: false }));
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "email",
        header: "Email",
        size: 150,
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
      },
      {
        accessorKey: "role",
        header: "Role",
        filterVariant: "select",
        filterSelectOptions: [
          { text: "All", value: "all" },
          { text: "Admin", value: "admin" },
          { text: "User", value: "user" },
        ],
        size: 200,
      },
      {
        accessorKey: "phone",
        header: "Phone",
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
          { text: "Active", value: "true" },
          { text: "Inactive", value: "false" },
        ],
        Cell: ({ row: { original } }) => (
          <div>
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
          </div>
        ),
        size: 150,
      },
    ],
    [loadingStatus]
  );
  const paginationProps = generatePaginationProps({
    total,
    pagination,
    setPagination,
  });
  return (
    <>
      {verify ? (
        <div className="App">
          <h2 style={{ textAlign: "left" }}>Users List</h2>
          <CustomTable
            columns={columns}
            data={users}
            totalCount={total}
            isLoading={isLoading}
            onColumnFiltersChange={setColumnFilters}
            paginationProps={paginationProps}
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
