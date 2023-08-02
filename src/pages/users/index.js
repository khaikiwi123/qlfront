import React, { useEffect, useState } from "react";
import Link from "next/link";
import Router from "next/router";
import { Layout, Button, Modal } from "antd";
import api from "@/api/api";
import useLogout from "@/hooks/useLogout";
import useColumnSearch from "@/hooks/useColumnSearch";
import AppHeader from "@/components/header";
import AppSider from "@/components/sider";
import UserTable from "@/components/table";

const { Content } = Layout;
const App = () => {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState({});
  const [currID, setCurrID] = useState("");
  const [role, setRole] = useState("");
  const [pagination, setPagination] = useState({
    pageIndex: 1,
    pageSize: 10,
  });

  const { logOut } = useLogout();
  const {
    searchParams,
    handleSearch,
    handleReset,
    getColumnSearchProps,
    setSearchParams,
    handleTableChange,
  } = useColumnSearch();

  useEffect(() => {
    setRole(localStorage.getItem("role"));
  }, []);

  const toggleStatus = async (_id, currentStatus) => {
    setLoadingStatus((prevState) => ({ ...prevState, [_id]: true }));

    try {
      await api.put(`/users/${_id}`, { status: !currentStatus });
      setData((prevUsers) =>
        prevUsers.map((user) =>
          user._id === _id ? { ...user, status: !currentStatus } : user
        )
      );
    } catch (error) {
      console.error(error);
    }

    setLoadingStatus((prevState) => ({ ...prevState, [_id]: false }));
  };

  const clearAllFilters = () => {
    setSearchParams([]);
  };

  useEffect(() => {
    setCurrID(localStorage.getItem("currID"));
    setLoading(true);
    const { pageIndex, pageSize } = pagination;

    let params = {};
    if (pageSize !== "All") {
      params = {
        pageNumber: pageIndex,
        pageSize: pageSize,
      };
    }

    const transformedFilters = searchParams.reduce((acc, filter) => {
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
        setData(res.data.users);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        if (error.response) {
          if (error.response.status === 401) {
            Modal.error({
              title: "Session expired",
              content: "Please log in again",
              onOk() {
                logOut();
              },
            });
          } else if (error.response.status === 403) {
            Modal.confirm({
              title: "Unauthorized Access",
              content: "You do not have permission to view this page",
              okText: "Go back to Home",
              cancelText: "Logout",
              onOk() {
                Router.push("/home");
              },
              onCancel() {
                logOut();
              },
            });
          } else {
            Modal.error({
              title: "An error occurred",
              content: error.response.data.message || "Please try again later",
            });
          }
        } else {
          Modal.error({
            title: "An error occurred",
            content: "Please try again later",
          });
        }
        console.error(error);
      });
  }, [pagination, searchParams]);

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      ...getColumnSearchProps("name", handleSearch, handleReset),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      ...getColumnSearchProps("email", handleSearch, handleReset),
      render: (text, record) => (
        <Link href={`/users/${record._id}`}>
          <Button
            type="link"
            color="neutral"
            size="sm"
            variant="plain"
            onClick={(e) => {
              e.preventDefault();
              Router.push(`/users/${record._id}`);
            }}
          >
            {record.email}
          </Button>
        </Link>
      ),
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      ...getColumnSearchProps("phone", handleSearch, handleReset),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      filterMultiple: false,
      filters: [
        { text: "Admin", value: "admin" },
        { text: "User", value: "user" },
      ],
      onFilter: (value, record) => record.role.indexOf(value) === 0,
      filteredValue: searchParams.find((o) => o.id === "role")
        ? [searchParams.find((o) => o.id === "role").value]
        : [],
    },
    {
      title: "Created Date",
      dataIndex: "createdDate",
      key: "createdDate",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      filterMultiple: false,
      filters: [
        { text: "Active", value: true },
        { text: "Inactive", value: false },
      ],
      onFilter: (value, record) => record.status === value,
      filteredValue: searchParams.find((o) => o.id === "status")
        ? [searchParams.find((o) => o.id === "status").value]
        : [],
      render: (text, record) => (
        <button
          onClick={() => toggleStatus(record._id, record.status)}
          disabled={loadingStatus[record._id] || record._id === currID}
          title={record._id === currID ? "Can't deactivate current user" : ""}
        >
          {loadingStatus[record._id]
            ? "Loading..."
            : record.status
            ? "Active"
            : "Inactive"}
        </button>
      ),
    },
  ];
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <AppHeader />
      <Layout>
        <AppSider role={role} />
        <Content style={{ margin: "24px 16px 0" }}>
          <div style={{ padding: 24, minHeight: 360 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "0px",
              }}
            >
              <h1 style={{ fontSize: "2em" }}>User List</h1>
              <Button onClick={clearAllFilters}>Clear All Filters</Button>
            </div>
            <UserTable
              columns={columns}
              data={data}
              total={total}
              loading={loading}
              pagination={pagination}
              handleTableChange={handleTableChange}
              setPagination={setPagination}
            />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;
