import React, { useEffect, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/router";
import dayjs from "dayjs";

import { Layout, Tooltip, Spin } from "antd";
const { Content } = Layout;

import api from "@/api/api";
import checkLogin from "@/Utils/checkLogin";
import authErr from "@/api/authErr";

import useLogout from "@/hooks/useLogout";

import AppHeader from "@/components/header";
import AppSider from "@/components/sider";
import UserTable from "@/components/table";
import FilterModal from "@/components/filter";

const ProtectedPage = () => {
  const router = useRouter();
  const [customers, setCustomers] = useState([]);
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
    setLoading(true);
    const { pageIndex, pageSize } = pagination;

    let params = {};
    if (pageSize !== "All") {
      params = {
        pageNumber: pageIndex,
        pageSize: pageSize,
      };
    }
    if (email && !isSet) {
      params.email = email;
      setIsSet(true);
    }
    params = {
      ...params,
      ...appliedFilters,
    };
    fetchCustomer(params);
  }, [pagination, appliedFilters, router.isReady]);

  const fetchCustomer = (params) => {
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
      .get(`/customers/?${queryParams}`)
      .then((res) => {
        setTotal(res.data.total);
        setCustomers(res.data.customers);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        authErr(error, logOut);
      });
  };

  let baseColumns = [
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
      ellipsis: true,
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
          <Link href={`/customers/${record._id}`}>
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
    {
      title: "Sản phẩm",
      dataIndex: "product",
      key: "product",
      ellipsis: true,

      render: (text, record) => (
        <Tooltip placement="topLeft" title={record.product}>
          <Link href={`/products?prodName=${record.product}`}>
            <div
              style={{
                width: "100%",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                cursor: "pointer",
              }}
            >
              {record.product}
            </div>
          </Link>
        </Tooltip>
      ),
    },
  ];
  const baseFilter = [
    { label: "Số điện thoại", value: "phone" },
    { label: "Email", value: "email" },
    { label: "Đơn vị", value: "org" },
    { label: "Người đại diện", value: "rep" },
  ];
  if (role === "admin") {
    baseColumns.push({
      title: "Chịu trách nhiệm",
      dataIndex: "inCharge",
      key: "inCharge",
    });
    baseFilter.push({ label: "Người chịu trách nhiệm", value: "inCharge" });
  }
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

  const filterOptions = baseFilter;
  const columns = baseColumns;
  return (
    <>
      <Layout style={{ minHeight: "100vh" }}>
        <AppHeader />
        <Layout className="layoutC">
          <AppSider role={role} />
          <Content style={{ margin: "30px 0 0" }}>
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
                  Danh sách khách hàng
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
                data={customers}
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
