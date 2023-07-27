import React, { useEffect, useState, useMemo } from "react";
import api from "../../api/api";
import Link from "next/link";
import { Button } from "@mui/joy";
import { useRouter } from "next/router";
import useLogout from "../../hooks/useLogout";
import { CustomTable } from "@/Utils/table";
import generatePaginationProps from "@/Utils/pagination";

const ProtectedPage = () => {
  const [clients, setclients] = useState([]);
  const [verify, setVerify] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [columnFilters, setColumnFilters] = useState([]);
  const [loadFilter, setLoadFilter] = useState(false);
  const [userId, setUserId] = useState("");
  const [input, setInput] = useState("");

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

    const transformedFilters = columnFilters.reduce((acc, filter) => {
      acc[filter.id] = filter.value;

      return acc;
    }, {});

    params = {
      ...params,
      ...transformedFilters,
    };
    if (userId !== "") {
      params.userId = userId;
    }

    api
      .get("/clients/", { params })
      .then((res) => {
        setTotal(res.data.total);
        setclients(res.data.clients);
        setLoadFilter(false);
        setIsLoading(false);
      })
      .catch((error) => {
        setLoadFilter(false);
        setIsLoading(false);
        if (error.response && error.response.status === 401) {
          setVerify(false);
        }
        console.error(error);
      });
  }, [pagination, columnFilters, userId]);
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "2-digit", day: "2-digit" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const columns = useMemo(() => [
    {
      accessorKey: "email",
      header: "Email",
      size: 150,
    },
    {
      accessorKey: "unit",
      header: "Unit",
      size: 200,
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
            {props.row.original.unit}
          </Button>
        </Link>
      ),
    },
    {
      accessorKey: "represent",
      header: "Representer",
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
        { text: "Đã kí kết", value: "true" },
        { text: "Đang chăm sóc", value: "false" },
      ],
      Cell: ({ row: { original } }) => (
        <div>{original.status ? "Đã kí kết" : "Đang chăm sóc"}</div>
      ),
      size: 150,
    },
  ]);
  const handleUserIdChange = () => {
    if (input.trim() === "" || input === userId) return;
    setLoadFilter(true);
    setUserId(input);
  };

  const clearFilter = () => {
    if (userId === "") return;
    setLoadFilter(true);
    setInput("");
    setUserId("");
  };
  const paginationProps = generatePaginationProps({
    total,
    pagination,
    setPagination,
  });

  return (
    <>
      {verify ? (
        <div className="App">
          <h2 style={{ textAlign: "left" }}>clients List</h2>
          <CustomTable
            columns={columns}
            data={clients}
            totalCount={total}
            isLoading={isLoading}
            onColumnFiltersChange={setColumnFilters}
            paginationProps={paginationProps}
          />
          <p>
            <input
              type="text"
              placeholder="User filter"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />

            <button disabled={loadFilter} onClick={handleUserIdChange}>
              {loadFilter ? "Loading..." : "Set User Filter"}
            </button>
            <button disabled={loadFilter} onClick={clearFilter}>
              {loadFilter ? "Loading..." : "Clear User Filter"}
            </button>
          </p>
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
