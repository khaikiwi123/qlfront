import React, { useEffect, useState } from "react";

import { useRouter } from "next/router";

import {
  Layout,
  Button,
  Tooltip,
  Space,
  Spin,
  Tabs,
  Menu,
  Dropdown,
  Modal,
  Row,
  Col,
} from "antd";
import { EditOutlined, EllipsisOutlined } from "@ant-design/icons";

const { Content } = Layout;
const { TabPane } = Tabs;
import api from "@/api/api";
import checkLogin from "@/Utils/checkLogin";
import authErr from "@/api/authErr";

import useLogout from "@/hooks/useLogout";

import AppHeader from "@/components/header";
import AppSider from "@/components/sider";
import UserTable from "@/components/table";
import CreateForm from "@/components/CreateProduct";
import ProdUp from "@/components/UpdateProd";

const ProtectedPage = () => {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isSet, setIsSet] = useState(false);
  const [createOk, setOk] = useState(false);
  const [tabLoading, setTabLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [role, setRole] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showUpModal, setShowUpModal] = useState(false);
  const [isRouterReady, setIsRouterReady] = useState(false);
  const [selectedProd, setSelectedProd] = useState(null);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [productToChange, setProductToChange] = useState(null);
  const [newStatus, setNewStatus] = useState(null);

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
    if (activeTab !== "All") {
      params.status = activeTab;
    }
    getProducts(params);
  }, [pagination, createOk, router.isReady, activeTab]);
  const handleConfirmStatusChange = () => {
    if (!productToChange || !newStatus) return;

    api
      .put(`/products/${productToChange._id}`, { status: newStatus })
      .then((response) => {
        setOk((prev) => !prev);
        setIsConfirmModalVisible(false);
      })
      .catch((error) => {
        console.error("Failed to update status", error);
      });
  };

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

  let baseColumns = [
    {
      title: "Tên",
      dataIndex: "prodName",
      key: "prodName",
      fixed: "left",
    },
    {
      title: "Giá (₫/tháng)",
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
  ];
  if (activeTab === "All") {
    baseColumns.push({
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: "180px",
      render: (status) => {
        switch (status) {
          case "active":
            return <span style={{ color: "green" }}>Được sử dụng</span>;
          case "inactive":
            return <span style={{ color: "red" }}>Tạm thời dừng</span>;
          case "delete":
            return <span style={{ color: "gray" }}>Đã xóa</span>;
          default:
            return status;
        }
      },
    });
  }
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
              setSelectedProd(record);
            }}
          />
          <Dropdown overlay={getDropdownMenu(record)} placement="bottom">
            <EllipsisOutlined />
          </Dropdown>

          <ProdUp
            visible={showUpModal}
            onClose={() => {
              setShowUpModal(false);
            }}
            product={selectedProd}
            onSuccess={() => setOk((prev) => !prev)}
          />
        </Space>
      ),
    });
  }

  const getDropdownMenu = (record) => {
    let menuItems = [];

    const handleMenuItemClick = (status) => {
      setProductToChange(record);
      setNewStatus(status);
      setIsConfirmModalVisible(true);
    };

    switch (record.status) {
      case "active":
        menuItems = [
          <Menu.Item
            key="inactive"
            onClick={() => handleMenuItemClick("inactive")}
          >
            Tạm dừng
          </Menu.Item>,
          <Menu.Divider key="divider1" />,
          <Menu.Item key="delete" onClick={() => handleMenuItemClick("delete")}>
            Xóa
          </Menu.Item>,
        ];
        break;
      case "inactive":
        menuItems = [
          <Menu.Item key="active" onClick={() => handleMenuItemClick("active")}>
            Sử dụng lại
          </Menu.Item>,
          <Menu.Divider key="divider1" />,
          <Menu.Item key="delete" onClick={() => handleMenuItemClick("delete")}>
            Xóa
          </Menu.Item>,
        ];
        break;
      case "delete":
        menuItems = [
          <Menu.Item key="active" onClick={() => handleMenuItemClick("active")}>
            Sử dụng lại
          </Menu.Item>,
        ];
        break;
      default:
        break;
    }

    return <Menu>{menuItems}</Menu>;
  };
  const statusOptions = [
    { value: "active", label: "Được sử dụng" },
    { value: "inactive", label: "Tạm thời dừng" },
    { value: "delete", label: "Đã xóa" },
  ];
  const formatStatus = (status) => {
    switch (status) {
      case "active":
        return "Được sử dụng";
      case "inactive":
        return "Tạm thời dừng";
      case "delete":
        return "Đã xóa";
      default:
        return status;
    }
  };

  const clearQuery = () => {
    router.push(router.pathname, undefined, { shallow: true });
    setOk((prev) => !prev);
    setPagination((prevState) => ({
      ...prevState,
      pageIndex: 1,
    }));
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
                    onSuccess={() => setOk((prev) => !prev)}
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
                <TabPane tab="Tất cả" key="All" disabled={tabLoading}></TabPane>
                {statusOptions.map((option) => (
                  <TabPane
                    tab={option.label}
                    key={option.value}
                    disabled={tabLoading}
                  ></TabPane>
                ))}
              </Tabs>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-start",
                  marginBottom: "16px",
                }}
              >
                {router.query.prodName && (
                  <Button
                    style={{
                      cursor: "pointer",
                    }}
                    onClick={clearQuery}
                  >
                    Xem tất cả sản phẩm
                  </Button>
                )}
              </div>
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
      <Modal
        title="Confirm Status Change"
        visible={isConfirmModalVisible}
        onCancel={() => setIsConfirmModalVisible(false)}
        footer={[
          <Row key="footerRow" style={{ width: "100%" }}>
            <Col span={2}>
              <Button
                key="cancel"
                onClick={() => setIsConfirmModalVisible(false)}
              >
                Không
              </Button>
            </Col>
            <Col span={22} style={{ textAlign: "right" }}>
              <Button
                key="submit"
                type="primary"
                onClick={handleConfirmStatusChange}
              >
                Có
              </Button>
            </Col>
          </Row>,
        ]}
      >
        <p>
          Bạn có chắc bạn muốn đổi trạng thái của {productToChange?.prodName}{" "}
          sang {formatStatus(newStatus)}?
        </p>
      </Modal>
    </>
  );
};
export default ProtectedPage;
