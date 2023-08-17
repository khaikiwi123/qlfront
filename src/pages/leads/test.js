import React, { useEffect, useState } from "react";
import Router from "next/router";
import { Layout, Button, Modal, DatePicker, Tooltip } from "antd";
import api from "@/api/api";
import useLogout from "@/hooks/useLogout";
import useColumnSearch from "@/hooks/useColumnSearch";
import AppHeader from "@/components/header";
import AppSider from "@/components/sider";
import UserTable from "@/components/table";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import checkLogin from "@/Utils/checkLogin";
const { Content } = Layout;
const ProtectedPage = () => {
  const [leads, setLeads] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
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

  useEffect(() => {
    const loggedIn = localStorage.getItem("logged_in");
    if (loggedIn !== "true") {
      checkLogin();
      return;
    }
    setRole(localStorage.getItem("role"));
    const currRole = localStorage.getItem("role");
    const id = localStorage.getItem("currUser");
    setLoading(true);
    const { pageIndex, pageSize } = pagination;

    let params = {};
    if (pageSize !== "All") {
      params = {
        pageNumber: pageIndex,
        pageSize: pageSize,
      };
      if (currRole !== "admin") {
        params.inCharge = id;
      }
    }

    const transformedFilters = searchParams.reduce((acc, filter) => {
      if (filter.id === "createdDate") {
        if (filter.value) {
          if (filter.value.startDate) {
            acc.startDate = filter.value.startDate;
          }
          if (filter.value.endDate) {
            acc.endDate = filter.value.endDate;
          }
        }
      } else if (filter.value !== "all") {
        acc[filter.id] = filter.value;
      }
      return acc;
    }, {});

    params = {
      ...params,
      ...transformedFilters,
    };

    api
      .get("/leads/", { params })
      .then((res) => {
        setTotal(res.data.total);
        setLeads(res.data.leads);
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
              okText: "Go back",
              cancelText: "Logout",
              onOk() {
                Router.push("/leads");
              },
              onCancel() {
                logOut();
              },
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

  const baseColumns = [
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      fixed: "left",
      filteredValue: searchParams.find((filter) => filter.id === "phone")?.value
        ? [searchParams.find((filter) => filter.id === "phone").value]
        : null,
      ...getColumnSearchProps("phone", handleSearch, handleReset),
    },

    {
      title: "Created Date",
      dataIndex: "createdDate",
      key: "createdDate",
      render: (date) => {
        return dayjs(date).format("DD/MM/YYYY");
      },
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }) => (
        <div style={{ padding: 8 }}>
          <DatePicker.RangePicker
            style={{ marginBottom: 8, display: "block" }}
            onChange={(dates) => {
              const formattedStart = dates[0]
                ? dates[0].format("DD/MM/YYYY")
                : null;
              const formattedEnd = dates[1]
                ? dates[1].format("DD/MM/YYYY")
                : null;
              setSelectedKeys([
                { startDate: formattedStart, endDate: formattedEnd },
              ]);
            }}
          />
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, "createdDate")}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90, marginRight: 8 }}
          >
            Search
          </Button>
          <Button
            onClick={() => handleReset(clearFilters, confirm, "createdDate")}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
        </div>
      ),
      onFilter: (value, record) => {
        if (!value || value.length !== 2) return true;
        const startDate = dayjs(value[0]);
        const endDate = dayjs(value[1]);
        const createdDate = dayjs(record.createdDate);
        return createdDate.isBetween(startDate, endDate, null, "[]");
      },
    },
  ];
  if (role === "admin") {
    baseColumns.push({
      title: "In Charge",
      dataIndex: "inCharge",
      key: "inCharge",
      ...getColumnSearchProps("inCharge", handleSearch, handleReset),
    });
  }

  const columns = baseColumns;

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
                  Leads Contact
                  <PlusOutlined
                    style={{ marginLeft: "10px", cursor: "pointer" }}
                    onClick={() => setShowCreateButton(!showCreateButton)}
                  />
                  {showCreateButton && (
                    <Button
                      type="primary"
                      style={{ marginLeft: "10px" }}
                      onClick={() => Router.push("/leads/create")}
                    >
                      Create
                    </Button>
                  )}
                </h1>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <Button onClick={clearAllFilters}>Clear All Filters</Button>
                </div>
              </div>
              <UserTable
                key={Date.now()}
                columns={columns}
                data={leads}
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
export default ProtectedPage;
