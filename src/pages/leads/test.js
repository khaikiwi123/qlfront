import React, { useEffect, useState } from "react";
import Link from "next/link";
import Router from "next/router";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Layout, Button, Tooltip } from "antd";
import { PlusOutlined, FilterOutlined } from "@ant-design/icons";

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

dayjs.extend(relativeTime);
const ProtectedPage = () => {
  const [leads, setLeads] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currUser, setCurrUser] = useState("");
  const [createOk, setOk] = useState(false);
  const [role, setRole] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({});

  const [filterModalVisible, setFilterModalVisible] = useState(false);
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
    params = {
      ...params,
      ...appliedFilters,
    };
    fetchLead(params);
  }, [pagination, createOk, appliedFilters]);

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
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      fixed: "left",

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
    },

    {
      title: "Created Date",
      dataIndex: "createdDate",
      key: "createdDate",
      render: (date) => {
        return dayjs(date).format("DD/MM/YYYY");
      },
    },

    {
      title: "Status",
      dataIndex: "status",
      key: "status",
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
    },
  ];
  if (role === "admin") {
    baseColumns.push({
      title: "In Charge",
      dataIndex: "inCharge",
      key: "inCharge",
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
                    onClick={() => setShowModal(true)}
                  />
                  <CreateForm
                    visible={showModal}
                    onClose={() => setShowModal(false)}
                    roleId={role}
                    userId={currUser}
                    onSuccess={() => setOk(true)}
                  />
                </h1>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <Button
                    icon={<FilterOutlined />}
                    onClick={() => setFilterModalVisible(true)}
                  >
                    Filter
                  </Button>
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
          <FilterModal
            isVisible={filterModalVisible}
            onClose={() => setFilterModalVisible(false)}
            onFilterApply={(newFilters) => {
              setAppliedFilters(newFilters);
              setPagination({ ...pagination, pageIndex: 1 });
            }}
            onResetall={() => {
              setAppliedFilters({});
              setFilterModalVisible(false);
            }}
          />
        </Layout>
      </Layout>
    </>
  );
};
export default ProtectedPage;
