import React, { useEffect, useState } from "react";
import Link from "next/link";
import Router from "next/router";
import { Layout, Button, Modal, Select } from "antd";
import api from "@/api/api";
import useLogout from "@/hooks/useLogout";
import useColumnSearch from "@/hooks/useColumnSearch";
import AppHeader from "@/components/header";
import AppSider from "@/components/sider";
import UserTable from "@/components/table";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";
import format from "date-fns/format";
import authErr from "@/api/authErr";

const { Content } = Layout;
const App = () => {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState({});
  const [currID, setCurrID] = useState("");
  const [role, setRole] = useState("");
  const [showCreateButton, setShowCreateButton] = useState(false);
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
    clearAllFilters,
  } = useColumnSearch();

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

  useEffect(() => {
    setRole(localStorage.getItem("role"));
    const loggedIn = localStorage.getItem("logged_in");
    if (loggedIn !== "true") {
      checkLogin();
      return;
    }
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
        authErr(error, logOut);
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
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (text) => {
        switch (text) {
          case "admin":
            return "Admin";
          case "user":
            return "N.V Sale";
          default:
            return text;
        }
      },
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }) => (
        <div style={{ padding: 8 }}>
          <Select
            style={{ width: 188, marginBottom: 8, display: "block" }}
            placeholder="Select Role"
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e ? [e] : [])}
          >
            <Select.Option value="">All</Select.Option>
            <Select.Option value="admin">Admin</Select.Option>
            <Select.Option value="user">User</Select.Option>
          </Select>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, "role")}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90, marginRight: 8 }}
          >
            Search
          </Button>
          <Button
            onClick={() => handleReset(clearFilters, confirm, "role")}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
        </div>
      ),
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
      ),
      onFilter: (value, record) =>
        record["role"]
          ? record["role"]
              .toString()
              .toLowerCase()
              .includes(value.toLowerCase())
          : "",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      ...getColumnSearchProps("phone", handleSearch, handleReset),
    },
    {
      title: "Created Date",
      dataIndex: "createdDate",
      key: "createdDate",
      render: (date) => {
        return format(new Date(date), "dd/MM/yyyy");
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }) => (
        <div style={{ padding: 8 }}>
          <Select
            style={{ width: 188, marginBottom: 8, display: "block" }}
            placeholder="Select Status"
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e !== "" ? [e] : [])}
          >
            <Select.Option value="true">Đang hoạt động</Select.Option>
            <Select.Option value="false">Đã bị khóa</Select.Option>
          </Select>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, "status")}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90, marginRight: 8 }}
          >
            Search
          </Button>
          <Button
            onClick={() => handleReset(clearFilters, confirm, "status")}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
        </div>
      ),
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
      ),
      onFilter: (value, record) => record["status"].toString() === value,
      render: (text, record) => (
        <button
          onClick={() => toggleStatus(record._id, record.status)}
          disabled={loadingStatus[record._id] || record._id === currID}
          title={record._id === currID ? "Can't deactivate current user" : ""}
        >
          {loadingStatus[record._id]
            ? "Loading..."
            : record.status
            ? "Đang hoạt động"
            : "Đã bị khóa"}
        </button>
      ),
    },
  ];
  return (
    <>
      <Layout style={{ minHeight: "100vh" }}>
        <AppHeader />
        <Layout style={{ marginLeft: 200, marginTop: 64, minHeight: "100vh" }}>
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
                <h1
                  style={{
                    fontSize: "2em",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  User List
                  <PlusOutlined
                    style={{ marginLeft: "10px", cursor: "pointer" }}
                    onClick={() => setShowCreateButton(!showCreateButton)}
                  />
                  {showCreateButton && (
                    <Button
                      type="primary"
                      style={{ marginLeft: "10px" }}
                      onClick={() => Router.push("/users/create")}
                    >
                      Create
                    </Button>
                  )}
                </h1>
                <div>
                  <Button onClick={clearAllFilters}>Clear All Filters</Button>
                </div>
              </div>
              <UserTable
                key={Date.now()}
                columns={columns}
                data={data}
                total={total}
                loading={loading}
                pagination={pagination}
                setPagination={setPagination}
              />
            </div>
          </Content>
        </Layout>
      </Layout>
    </>
  );
};

export default App;
