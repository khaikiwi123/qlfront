import React, { useEffect, useState } from "react";

import { useRouter } from "next/router";

import { Layout, Button, Tooltip, Space, Spin } from "antd";
import { EditOutlined } from "@ant-design/icons";

const { Content } = Layout;

import api from "@/api/api";
import checkLogin from "@/Utils/checkLogin";
import authErr from "@/api/authErr";

import useLogout from "@/hooks/useLogout";

import AppHeader from "@/components/header";
import AppSider from "@/components/sider";
import UserTable from "@/components/table";
import FilterModal from "@/components/filter";
import CreateForm from "@/components/CreateProduct";
import ProdUp from "@/components/UpdateProd";

const ProtectedPage = () => {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isSet, setIsSet] = useState(false);
  const [createOk, setOk] = useState(false);
  const [role, setRole] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showUpModal, setShowUpModal] = useState(false);
  const [isRouterReady, setIsRouterReady] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);

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

    if (createOk) {
      setOk(false);
    }
    if (!router.isReady) return;
    if (router.isReady) {
      setIsRouterReady(true);
    }
    const prodName = router.query.prodName;
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
    if (prodName && !isSet) {
      params.prodName = prodName;
      setIsSet(true);
    }
    params = {
      ...params,
      ...appliedFilters,
    };
    getProducts(params);
  }, [pagination, createOk, appliedFilters, router.isReady]);

  const getProducts = (params) => {
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
      .get(`/products/?${queryParams}`)
      .then((res) => {
        setTotal(res.data.total);
        setProducts(res.data.products);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        authErr(error, logOut);
      });
  };
  function formatVND(price) {
    return new Intl.NumberFormat("vi-VN").format(price).replace(",", ".");
  }

  let baseColumns = [
    {
      title: "Tên",
      dataIndex: "prodName",
      key: "prodName",
      fixed: "left",
    },
    {
      title: "Giá (₫)",
      dataIndex: "price",
      key: "price",
      render: (price) => formatVND(price),
    },
    {
      title: "Thông tin",
      dataIndex: "description",
      key: "desc",
      ellipsis: {
        showTitle: false,
      },
      render: (description) => (
        <Tooltip placement="topLeft" title={description}>
          {description}
        </Tooltip>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: "180px",
      render: (status) => {
        switch (status) {
          case "active":
            return <span style={{ color: "green" }}>Active</span>;
          case "inactive":
            return <span style={{ color: "red" }}>Inactive</span>;
          case "delete":
            return <span style={{ color: "gray" }}>Removed</span>;
          default:
            return status;
        }
      },
    },
  ];
  if (role === "admin") {
    baseColumns.push({
      title: "Thao tác",
      key: "action",
      width: "100px",
      align: "center",
      fixed: "right",
      render: (record) => (
        <Space size="middle">
          <EditOutlined
            onClick={() => {
              setShowUpModal(true);
              setSelectedProductId(record._id);
            }}
          />

          <ProdUp
            visible={showUpModal}
            onClose={() => {
              setShowUpModal(false);
              setSelectedProductId(null);
            }}
            id={selectedProductId}
            onSuccess={() => setOk((prev) => !prev)}
          />
        </Space>
      ),
    });
  }
  const baseFilter = [
    { label: "Tên", value: "prodName" },
    { label: "Giá", value: "price" },
    //need status filter and time filter
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
                  Sản phẩm
                </h1>
                <div style={{ display: "flex", alignItems: "center" }}>
                  {role === "admin" ? (
                    <Button
                      style={{
                        marginLeft: "10px",
                        cursor: "pointer",
                        marginTop: "10px",
                      }}
                      onClick={() => setShowModal(true)}
                      type="primary"
                    >
                      Tạo sản phẩm
                    </Button>
                  ) : null}
                  <CreateForm
                    visible={showModal}
                    onClose={() => setShowModal(false)}
                    onSuccess={() => setOk(true)}
                  />
                </div>
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
                data={products}
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
