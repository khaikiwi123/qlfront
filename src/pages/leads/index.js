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
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import format from "date-fns/format";
import checkLogin from "@/Utils/checkLogin";
import AppCrumbs from "@/components/breadcrumbs";
const { Content } = Layout;
const { Option } = Select;

const ProtectedPage = () => {
  const [leads, setLeads] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("");
  const [userId, setUserId] = useState("");
  const [trigger, setTrigger] = useState(false);
  const [showCreateButton, setShowCreateButton] = useState(false);
  const [pagination, setPagination] = useState({
    pageIndex: 1,
    pageSize: 10,
  });
  const { logOut } = useLogout();
  const { searchParams, handleSearch, handleReset, getColumnSearchProps } =
    useColumnSearch();

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
      params.inCharge = userId;
    }

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
              okText: "Go back to Home",
              cancelText: "Logout",
              onOk() {
                Router.push("/home");
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
  }, [pagination, searchParams, trigger]);

  const columns = [
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      ...getColumnSearchProps("phone", handleSearch, handleReset),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      ...getColumnSearchProps("email", handleSearch, handleReset),
    },
    {
      title: "Organization",
      dataIndex: "org",
      key: "org",
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
      ...getColumnSearchProps("rep", handleSearch, handleReset),
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
      render: (status) => {
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
          case "Sucess":
            displayStatus = "Thành công";
            break;
          default:
            displayStatus = "";
        }
        return <span>{displayStatus}</span>;
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

  return (
    <>
      <style jsx global>{`
        body,
        html {
          margin: 0;
          padding: 0;
        }
      `}</style>
      <Layout style={{ minHeight: "100vh" }}>
        <AppHeader />
        <Layout style={{ marginLeft: 200, marginTop: 64, minHeight: "100vh" }}>
          <AppSider role={role} />
          <Content style={{ margin: "24px 16px 0" }}>
            <div style={{ padding: 24, minHeight: 360 }}>
              <AppCrumbs
                paths={[{ name: "Home", href: "/home" }, { name: "Leads" }]}
              />
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
                  Potential Lead List
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
                  {role === "admin" && (
                    <>
                      <Input
                        placeholder="Person In Charge Filter"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        style={{ width: 200, marginRight: "10px" }}
                      />
                      <Button onClick={() => setTrigger(!trigger)}>
                        Set Filter
                      </Button>
                      <Button
                        onClick={() => {
                          setUserId("");
                          setTrigger(!trigger);
                        }}
                      >
                        Clear Filter
                      </Button>
                    </>
                  )}
                </div>
              </div>
              <UserTable
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
