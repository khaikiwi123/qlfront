import React, { useEffect, useState } from "react";
import Link from "next/link";
import Router from "next/router";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Layout, Button, Tooltip } from "antd";
import { PlusOutlined } from "@ant-design/icons";

import AppHeader from "@/components/header";
import AppSider from "@/components/sider";
import UserTable from "@/components/table";
import CreateForm from "@/components/CreateForm";

import useLogout from "@/hooks/useLogout";
import useColumnSearch from "@/hooks/useColumnSearch";

import api from "@/api/api";
import checkLogin from "@/Utils/checkLogin";
import authErr from "@/api/authErr";
import { translateStatus } from "@/Utils/translate";

const { Content } = Layout;

dayjs.extend(relativeTime);

const ProtectedPage = () => {
  const [leads, setLeads] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currUser, setCurrUser] = useState("");
  const [createOk, setOk] = useState(false);
  const [role, setRole] = useState(null);
  const [showCreateButton, setShowCreateButton] = useState(false);
  const [showModal, setShowModal] = useState(false);
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
    getColumnDateFilterProps,
    getColumnSelectFilterProps,
  } = useColumnSearch();

  useEffect(() => {
    const loggedIn = localStorage.getItem("logged_in");
    if (loggedIn !== "true") {
      checkLogin();
      return;
    }
    if (createOk) {
      setOk(false);
    }
    setRole(localStorage.getItem("role"));
    setCurrUser(localStorage.getItem("currUser"));
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
    fetchLead(params);
  }, [pagination, searchParams, createOk]);
  const fetchLead = (params) => {
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
  };

  const baseColumns = [
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      fixed: "left",
      ellipsis: true,

      ...getColumnSearchProps("phone", handleSearch, handleReset, searchParams),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      fixed: "left",

      ...getColumnSearchProps("email", handleSearch, handleReset, searchParams),
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
      ...getColumnSearchProps("org", handleSearch, handleReset, searchParams),
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

      ...getColumnSearchProps("rep", handleSearch, handleReset, searchParams),
    },

    {
      title: "Created Date",
      dataIndex: "createdDate",
      key: "createdDate",
      render: (date) => {
        return dayjs(date).format("DD/MM/YYYY");
      },
      ...getColumnDateFilterProps("createdDate", handleSearch, handleReset),
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
        const displayStatus = translateStatus(status);
        const lastUpdated = record.statusUpdate
          ? `Last updated ${dayjs(record.statusUpdate).fromNow()}`
          : "";

        return (
          <Tooltip title={lastUpdated}>
            <span>{displayStatus}</span>
          </Tooltip>
        );
      },
      ...getColumnSelectFilterProps(
        "status",
        handleSearch,
        handleReset,
        searchParams
      ),
    },
  ];
  if (role === "admin") {
    baseColumns.push({
      title: "In Charge",
      dataIndex: "inCharge",
      key: "inCharge",
      ...getColumnSearchProps(
        "inCharge",
        handleSearch,
        handleReset,
        searchParams
      ),
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
                      onClick={() => setShowModal(true)}
                    >
                      Create
                    </Button>
                  )}
                  <CreateForm
                    visible={showModal}
                    onClose={() => setShowModal(false)}
                    roleId={role}
                    userId={currUser}
                    onSuccess={() => setOk(true)}
                  />
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
