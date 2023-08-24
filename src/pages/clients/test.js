import React, { useEffect, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/router";
import dayjs from "dayjs";

import { Layout, Button, Tooltip, Spin } from "antd";
const { Content } = Layout;

import api from "@/api/api";
import checkLogin from "@/Utils/checkLogin";
import authErr from "@/api/authErr";

import useLogout from "@/hooks/useLogout";

import AppHeader from "@/components/header";
import AppSider from "@/components/sider";
import UserTable from "@/components/table";
import FilterModal from "@/components/filterTest";

const ProtectedPage = () => {
  const router = useRouter();
  const [clients, setClients] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isSet, setIsSet] = useState(false);
  const [role, setRole] = useState("");
  const [isRouterReady, setIsRouterReady] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({});
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
    if (!router.isReady) return;
    if (router.isReady) {
      setIsRouterReady(true);
    }
    const email = router.query.email;
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
    if (email && !isSet) {
      params.email = email;
      setIsSet(true);
    }
    params = {
      ...params,
      ...appliedFilters,
    };
    fetchClient(params);
  }, [pagination, appliedFilters, router.isReady]);

  const fetchClient = (params) => {
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
      .get(`/clients/?${queryParams}`)
      .then((res) => {
        setTotal(res.data.total);
        setClients(res.data.clients);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        authErr(error, logOut);
      });
  };
  if (!isRouterReady) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  let baseColumns = [
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
        <Link href={`/clients/${record._id}`}>
          <Button
            type="link"
            color="neutral"
            size="sm"
            variant="plain"
            onClick={(e) => {
              e.preventDefault();
              router.push(`/clients/${record._id}`);
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
  ];
  const baseFilter = [
    { label: "Phone", value: "phone" },
    { label: "Email", value: "email" },
    { label: "Organization", value: "org" },
    { label: "Representative", value: "rep" },
  ];
  if (role === "admin") {
    baseColumns.push({
      title: "In Charge",
      dataIndex: "inCharge",
      key: "inCharge",
    });
    baseFilter.push({ label: "In Charge", value: "inCharge" });
  }
  if (!router.isReady) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  const filterOptions = baseFilter;
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
                  Accquired Customers
                </h1>
              </div>
              <FilterModal
                queryFilter={router.query}
                onFilterApply={(newFilters) => {
                  setAppliedFilters(newFilters);
                  setPagination({ ...pagination, pageIndex: 1 });
                }}
                filterOptions={filterOptions}
              />
              <UserTable
                key={Date.now()}
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
    </>
  );
};
export default ProtectedPage;
