import React, { useEffect, useState } from "react";
import Link from "next/link";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import { Layout, Button, Tooltip, Tabs } from "antd";

import AppHeader from "@/components/header";
import AppSider from "@/components/sider";
import UserTable from "@/components/table";
import CreateForm from "@/components/CreateForm";
import FilterModal from "@/components/filter";

import useLogout from "@/hooks/useLogout";

import api from "@/api/api";
import checkLogin from "@/Utils/checkLogin";
import authErr from "@/api/authErr";
import { translateStatus } from "@/Utils/translate";

const { Content } = Layout;
const { TabPane } = Tabs;
dayjs.extend(relativeTime);
dayjs.locale("vi");
const ProtectedPage = () => {
  const [leads, setLeads] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currUser, setCurrUser] = useState("");
  const [createOk, setOk] = useState(false);
  const [role, setRole] = useState(null);
  const [tabLoading, setTabLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({});
  const [activeTab, setActiveTab] = useState("All");
  const [pagination, setPagination] = useState({
    pageIndex: 1,
    pageSize: 10,
  });
  const { logOut } = useLogout();
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
    setLoading(true);
    const { pageIndex, pageSize } = pagination;
    let params = {};
    if (pageSize !== "All") {
      params = {
        pageNumber: pageIndex,
        pageSize: pageSize,
      };
    }
    params = {
      ...params,
      ...appliedFilters,
    };
    if (activeTab !== "All") {
      params.status = activeTab;
    }
    fetchLead(params);
  }, [pagination, createOk, appliedFilters, activeTab]);

  const fetchLead = (params) => {
    let queryParams = Object.keys(params)
      .map((key) => {
        if (Array.isArray(params[key])) {
          return params[key].map((value) => `${key}=${value}`).join("&");
        } else {
          return `${key}=${params[key]}`;
        }
      })
      .join("&");

    api
      .get(`/leads/?${queryParams}`)
      .then((res) => {
        setTotal(res.data.total);
        setLeads(res.data.leads);
        setLoading(false);
        setTabLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        authErr(error, logOut);
      });
  };

  const baseColumns = [
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      ellipsis: true,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      ellipsis: {
        showTitle: false,
      },
      render: (email) => (
        <Tooltip placement="topLeft" title={email}>
          {email}
        </Tooltip>
      ),
    },

    {
      title: "Đơn vị",
      dataIndex: "org",
      key: "org",
      ellipsis: true,
      render: (text, record) => (
        <Tooltip placement="topLeft" title={record.org}>
          <Link href={`/leads/${record._id}`}>
            <div
              style={{
                width: "100%",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                cursor: "pointer",
              }}
            >
              {record.org}
            </div>
          </Link>
        </Tooltip>
      ),
    },

    {
      title: "Người đại diện",
      dataIndex: "rep",
      key: "rep",
      ellipsis: {
        showTitle: false,
      },
      render: (rep) => (
        <Tooltip placement="topLeft" title={rep}>
          {rep}
        </Tooltip>
      ),
    },

    {
      title: "Ngày tạo",
      dataIndex: "createdDate",
      key: "createdDate",
      render: (date) => {
        return dayjs(date).format("DD/MM/YYYY");
      },
    },
  ];

  const baseFilter = [
    { label: "Số điện thoại", value: "phone" },
    { label: "Email", value: "email" },
    { label: "Tên đơn vị", value: "org" },
    { label: "Người đại diện", value: "rep" },
    { label: "Ngày tạo", value: "exactDate" },
    { label: "Ngày tạo từ", value: "dateRange" },
    { label: "Lần cập nhập cuối", value: "lastUp" },
  ];
  const statusOptions = [
    { value: "No contact", label: "Chưa Liên Hệ" },
    { value: "In contact", label: "Đã Liên Hệ" },
    { value: "Verified needs", label: "Đã Xác Định Nhu Cầu" },
    { value: "Consulted", label: "Đã Tư Vấn" },
    { value: "Success", label: "Thành Công" },
    { value: "Failed", label: "Thất Bại" },
  ];
  if (activeTab === "All") {
    baseColumns.push({
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status, record) => {
        const displayStatus = translateStatus(status);
        const lastUpdated = record.statusUpdate
          ? `Cập nhập từ ${dayjs(record.statusUpdate).fromNow()}`
          : "";

        return (
          <Tooltip title={lastUpdated}>
            <span>{displayStatus}</span>
          </Tooltip>
        );
      },
    });
  } else {
    baseColumns.push({
      title: "Lần cuối cập nhập",
      dataIndex: "statusUpdate",
      key: "statusUpdate",
      render: (statusUpdate) => {
        return dayjs(statusUpdate).fromNow();
      },
    });
  }
  if (role === "admin") {
    baseColumns.push({
      title: "Chịu trách nhiệm",
      dataIndex: "inCharge",
      key: "inCharge",
    });
    baseFilter.push({ label: "Người chịu trách nhiệm", value: "inCharge" });
  }

  const columns = baseColumns;
  const filterOptions = baseFilter;

  return (
    <>
      <Layout style={{ minHeight: "100vh" }}>
        <AppHeader />
        <Layout className="layoutC">
          <AppSider role={role} />

          <Content style={{ margin: "30px 0 0" }}>
            <div style={{ padding: 24 }}>
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
                  Lead
                </h1>

                <div style={{ display: "flex", alignItems: "center" }}>
                  <Button
                    style={{
                      marginLeft: "10px",
                      cursor: "pointer",
                      marginTop: "10px",
                    }}
                    onClick={() => setShowModal(true)}
                    type="primary"
                  >
                    Tạo lead
                  </Button>
                  <CreateForm
                    visible={showModal}
                    onClose={() => setShowModal(false)}
                    roleId={role}
                    userId={currUser}
                    onSuccess={() => setOk(true)}
                  />
                </div>
              </div>
              <Tabs
                defaultActiveKey="All"
                style={{ color: "#363636" }}
                type="card"
                onChange={(key) => {
                  setActiveTab(key);
                  setTabLoading(true);
                }}
              >
                <TabPane tab="All" key="All" disabled={tabLoading}></TabPane>
                {statusOptions.map((option) => (
                  <TabPane
                    tab={option.label}
                    key={option.value}
                    disabled={tabLoading}
                  ></TabPane>
                ))}
              </Tabs>
              <FilterModal
                onFilterApply={(newFilters) => {
                  setAppliedFilters(newFilters);
                  setPagination({ ...pagination, pageIndex: 1 });
                }}
                filterOptions={filterOptions}
                statusOptions={statusOptions}
              />
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
