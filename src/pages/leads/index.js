import React, { useEffect, useState } from "react";
import Link from "next/link";
import Router from "next/router";
import { Layout, Button, Modal, Select, DatePicker, Tooltip } from "antd";
import api from "@/api/api";
import useLogout from "@/hooks/useLogout";
import useColumnSearch from "@/hooks/useColumnSearch";
import AppHeader from "@/components/header";
import AppSider from "@/components/sider";
import UserTable from "@/components/table";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import checkLogin from "@/Utils/checkLogin";
import authErr from "@/api/authErr";
const { Content } = Layout;
const { Option } = Select;
dayjs.extend(relativeTime);

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
  const dateFormat = "DD/MM/YYYY";
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
      } else {
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
        authErr(error, logOut);
      });
  }, [pagination, searchParams]);

  const baseColumns = [
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      fixed: "left",
      ellipsis: true,
      filteredValue: searchParams.find((filter) => filter.id === "phone")?.value
        ? [searchParams.find((filter) => filter.id === "phone").value]
        : null,
      ...getColumnSearchProps("phone", handleSearch, handleReset),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      fixed: "left",
      filteredValue: searchParams.find((filter) => filter.id === "email")?.value
        ? [searchParams.find((filter) => filter.id === "email").value]
        : null,
      ...getColumnSearchProps("email", handleSearch, handleReset),
      ellipsis: true,
      render: (email) => (
        <Tooltip placement="topLeft" title={email}>
          {email}
        </Tooltip>
      ),
    },

    {
      title: "Organization",
      dataIndex: "org",
      key: "org",
      filteredValue: searchParams.find((filter) => filter.id === "org")?.value
        ? [searchParams.find((filter) => filter.id === "org").value]
        : null,
      ...getColumnSearchProps("org", handleSearch, handleReset),
      render: (text, record) => (
        <Link href={`/leads/${record._id}`}>
          <Button
            type="link"
            color="neutral"
            size="sm"
            variant="plain"
            onClick={(e) => {
              e.preventDefault();
              Router.push(`/leads/${record._id}`);
            }}
          >
            {record.org}
          </Button>
        </Link>
      ),
    },
    {
      title: "Representative",
      dataIndex: "rep",
      key: "rep",
      filteredValue: searchParams.find((filter) => filter.id === "rep")?.value
        ? [searchParams.find((filter) => filter.id === "rep").value]
        : null,
      ...getColumnSearchProps("rep", handleSearch, handleReset),
    },

    {
      title: "Created Date",
      dataIndex: "createdDate",
      key: "createdDate",
      render: (date) => {
        return dayjs(date).format("DD/MM/YYYY");
      },
      //maybe move this part out
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }) => (
        <div style={{ padding: 8 }}>
          <DatePicker.RangePicker
            style={{ marginBottom: 8, display: "block" }}
            format={dateFormat}
            allowEmpty={[true, true]}
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
            style={{ width: 90, marginRight: 10 }}
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
        const startDate = new Date(value[0]);
        const endDate = new Date(value[1]);
        const createdDate = new Date(record.createdDate);
        return createdDate >= startDate && createdDate <= endDate;
      },
    },

    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      filteredValue: searchParams.find((filter) => filter.id === "status")
        ?.value
        ? [searchParams.find((filter) => filter.id === "status").value]
        : null,
      render: (status, record) => {
        let displayStatus;
        switch (status) {
          case "No contact":
            displayStatus = "Chưa liên hệ";
            break;
          case "In contact":
            displayStatus = "Đã liên hệ";
            break;
          case "Verified needs":
            displayStatus = "Đã xác định nhu cầu";
            break;
          case "Consulted":
            displayStatus = "Đã tư vấn";
            break;
          case "Success":
            displayStatus = "Thành công";
            break;
          default:
            displayStatus = "";
        }
        const lastUpdated = record.statusUpdate
          ? `Last updated ${dayjs(record.statusUpdate).fromNow()}`
          : "";
        return (
          <Tooltip title={lastUpdated}>
            <span>{displayStatus}</span>
          </Tooltip>
        );
      },
      //maybe also this
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
            <Option value="No contact">Chưa liên hệ</Option>
            <Option value="In contact">Đã liên hệ</Option>
            <Option value="Verified needs">Đã xác định nhu cầu</Option>
            <Option value="Consulted">Đã tư vấn</Option>
            <Option value="Success">Thành công</Option>
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
