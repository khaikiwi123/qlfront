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

const ProtectedPage = () => {
  const [clients, setClients] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
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

  const clearAllFilters = () => {
    setSearchParams([]);
  };

  useEffect(() => {
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
      .get("/clients/", { params })
      .then((res) => {
        setTotal(res.data.total);
        setClients(res.data.clients);
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
      title: "Email",
      dataIndex: "email",
      key: "email",
      ...getColumnSearchProps("email", handleSearch, handleReset),
    },
    {
      title: "Unit",
      dataIndex: "unit",
      key: "unit",
      ...getColumnSearchProps("unit", handleSearch, handleReset),
      render: (text, record) => (
        <Link href={`/clients/${record._id}`}>
          <Button
            type="link"
            color="neutral"
            size="sm"
            variant="plain"
            onClick={(e) => {
              e.preventDefault();
              Router.push(`/clients/${record._id}`);
            }}
          >
            {record.unit}
          </Button>
        </Link>
      ),
    },
    {
      title: "Represented By",
      dataIndex: "represent",
      key: "represent",
      ...getColumnSearchProps("represent", handleSearch, handleReset),
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
        <div>{record.status ? "Active" : "Inactive"}</div>
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
              <h1 style={{ fontSize: "2em" }}>Client List</h1>
              <Button onClick={clearAllFilters}>Clear All Filters</Button>
            </div>
            <UserTable
              columns={columns}
              data={clients}
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
export default ProtectedPage;
