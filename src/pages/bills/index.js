import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import Link from "next/link";

import { Layout, Tooltip, Spin, Tabs } from "antd";
import dayjs from "dayjs";

const { Content } = Layout;

import api from "@/api/api";
import checkLogin from "@/Utils/checkLogin";
import authErr from "@/api/authErr";

import useLogout from "@/hooks/useLogout";

import AppHeader from "@/components/header";
import AppSider from "@/components/sider";
import UserTable from "@/components/table";
import FilterModal from "@/components/filter";
import { UserProvider } from "@/context/context";

const { TabPane } = Tabs;
const ProtectedPage = () => {
  const router = useRouter();
  const [bills, setBills] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isSet, setIsSet] = useState(false);
  const [role, setRole] = useState("");
  const [tabLoading, setTabLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
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
    setRole(localStorage.getItem("role"));

    if (!router.isReady) return;
    if (router.isReady) {
      setIsRouterReady(true);
    }
    const billId = router.query.customer;
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
    if (billId && !isSet) {
      params.customer = billId;
      setIsSet(true);
    }
    params = {
      ...params,
      ...appliedFilters,
    };
    if (activeTab !== "All") {
      params.status = activeTab;
    }
    getBills(params);
  }, [pagination, appliedFilters, router.isReady, activeTab]);

  const getBills = (params) => {
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
      .get(`/bills/?${queryParams}`)
      .then((res) => {
        setTotal(res.data.total);
        setBills(res.data.bills);
        setLoading(false);
        setTabLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        authErr(error, logOut);
      });
  };
  function formatVND(price) {
    return new Intl.NumberFormat("vi-VN").format(price).replace(",", ".");
  }

  const baseColumns = [
    {
      title: "Khách hàng",
      dataIndex: "customer",
      key: "customer",
      fixed: "left",
      render: (customer, record) => (
        <Tooltip placement="topLeft" title={record.org}>
          {customer}
        </Tooltip>
      ),
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

    {
      title: "Giá (₫)",
      dataIndex: "price",
      key: "price",
      render: (price) => formatVND(price),
    },
    {
      title: "Thời hạn (tháng)",
      dataIndex: "length",
      key: "length",
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
  if (role === "admin") {
    baseColumns.push({
      title: "Chịu trách nhiệm",
      dataIndex: "saleName",
      key: "saleName",
      render: (saleName, record) => (
        <Tooltip placement="topLeft" title={record.inCharge}>
          {saleName}
        </Tooltip>
      ),
    });
  }
  const baseFilter = [
    { label: "Khách hàng", value: "customer" },
    { label: "Giá", value: "price" },
    { label: "Người chịu trách nhiệm", value: "saleName" },
    { label: "Ngày được tạo", value: "exactDate" },
    { label: "Ngày được tạo từ", value: "dateRange" },
  ];
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
  if (activeTab === "All") {
    baseColumns.push({
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: "180px",
      render: (status) => {
        switch (status) {
          case "Active":
            return <span style={{ color: "green" }}>Đã xuất</span>;
          default:
            return <span style={{ color: "red" }}>Đã thu hồi</span>;
        }
      },
    });
  }
  const statusOptions = [
    { value: "Active", label: "Đã xuất" },
    { value: "Inactive", label: "Đã thu hồi" },
  ];
  const filterOptions = baseFilter;
  const columns = baseColumns;
  return (
    <>
      <UserProvider>
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
                    Bill
                  </h1>
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
                  <TabPane
                    tab="Tất cả"
                    key="All"
                    disabled={tabLoading}
                  ></TabPane>
                  {statusOptions.map((option) => (
                    <TabPane
                      tab={option.label}
                      key={option.value}
                      disabled={tabLoading}
                    ></TabPane>
                  ))}
                </Tabs>
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
                  data={bills}
                  total={total}
                  loading={loading}
                  pagination={pagination}
                  setPagination={setPagination}
                />
              </div>
            </Content>
          </Layout>
        </Layout>
      </UserProvider>
    </>
  );
};

export default ProtectedPage;
