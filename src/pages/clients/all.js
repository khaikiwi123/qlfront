import React, { useEffect, useState } from "react";
import Link from "next/link";
import Router from "next/router";
import { Layout, Button, Modal, Select, Input } from "antd";
import api from "@/api/api";
import useLogout from "@/hooks/useLogout";
import useColumnSearch from "@/hooks/useColumnSearch";
import AppHeader from "@/components/header";
import AppSider from "@/components/sider";
import UserTable from "@/components/table";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";

const { Content } = Layout;

const ProtectedPage = () => {
  const [clients, setClients] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [trigger, setTrigger] = useState(false);
  const [role, setRole] = useState("");
  const [userId, setUserId] = useState("");
  const [showCreateButton, setShowCreateButton] = useState(false);
  const [pagination, setPagination] = useState({
    pageIndex: 1,
    pageSize: 10,
  });
  const { logOut } = useLogout();
  const { searchParams, handleSearch, handleReset, getColumnSearchProps } =
    useColumnSearch();

  useEffect(() => {
    setRole(localStorage.getItem("role"));
  }, []);

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
    if (userId !== "") {
      params.userId = userId;
    }

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
  }, [pagination, searchParams, trigger]);

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
      render: (text, record) => (
        <div>{record.status ? "Taken care of" : "Negotiating"}</div>
      ),
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
            <Select.Option value="">All</Select.Option>
            <Select.Option value="true">Taken care of</Select.Option>
            <Select.Option value="false">Negotiating</Select.Option>
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
              <h1
                style={{
                  fontSize: "2em",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                Client List
                <PlusOutlined
                  style={{ marginLeft: "10px", cursor: "pointer" }}
                  onClick={() => setShowCreateButton(!showCreateButton)}
                />
                {showCreateButton && (
                  <Button
                    type="primary"
                    style={{ marginLeft: "10px" }}
                    onClick={() => Router.push("/clients/create")}
                  >
                    Create
                  </Button>
                )}
              </h1>

              <div style={{ display: "flex", alignItems: "center" }}>
                <Input
                  placeholder="Enter User Email"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  style={{ width: 200, marginRight: "10px" }}
                />
                <Button onClick={() => setTrigger(!trigger)}>
                  Search User
                </Button>
                <Button
                  onClick={() => {
                    setUserId("");
                    setTrigger(!trigger);
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
            <UserTable
              columns={columns}
              data={clients}
              total={total}
              loading={loading}
              pagination={pagination}
              setPagination={setPagination}
            />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};
export default ProtectedPage;
