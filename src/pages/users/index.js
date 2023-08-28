import React, { useEffect, useState } from "react";
import Link from "next/link";
import Router, { useRouter } from "next/router";
import { Layout, Button, Row, Col, Spin } from "antd";
import api from "@/api/api";
import useLogout from "@/hooks/useLogout";
import checkLogin from "@/Utils/checkLogin";
import AppHeader from "@/components/header";
import AppSider from "@/components/sider";
import UserTable from "@/components/table";
import authErr from "@/api/authErr";
import dayjs from "dayjs";
import FilterModal from "@/components/filter";
import CreateForm from "@/components/UserForm";

const { Content } = Layout;
const App = () => {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState({});
  const [currID, setCurrID] = useState("");
  const [role, setRole] = useState("");
  const [createOk, setOk] = useState(false);
  const [isRouterReady, setIsReady] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [pagination, setPagination] = useState({
    pageIndex: 1,
    pageSize: 10,
  });
  const router = useRouter();

  const { logOut } = useLogout();

  const toggleStatus = async (_id, currentStatus) => {
    setLoadingStatus((prevState) => ({ ...prevState, [_id]: true }));

    try {
      await api.put(`/users/${_id}`, { status: !currentStatus });
      setData((prevUsers) =>
        prevUsers.map((user) =>
          user._id === _id ? { ...user, status: !currentStatus } : user
        )
      );
    } catch (error) {
      console.error(error);
    }

    setLoadingStatus((prevState) => ({ ...prevState, [_id]: false }));
  };

  useEffect(() => {
    setRole(localStorage.getItem("role"));
    const loggedIn = localStorage.getItem("logged_in");
    if (loggedIn !== "true") {
      checkLogin();
      return;
    }
    if (createOk) {
      setOk(false);
    }
    setCurrID(localStorage.getItem("currID"));
    setLoading(true);
    if (router.isReady) {
      setIsReady(true);
    }
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
    fetchUser(params);
  }, [pagination, createOk, appliedFilters]);
  const fetchUser = (params) => {
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
      .get(`/users/?${queryParams}`)
      .then((res) => {
        setTotal(res.data.total);
        setData(res.data.users);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        authErr(error, logOut);
      });
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      ellipsis: true,
      render: (text, record) => (
        <div style={{ textAlign: "left" }}>
          <Link href={`/users/${record._id}`}>
            <Button
              type="link"
              color="neutral"
              size="sm"
              variant="plain"
              style={{ padding: 0, margin: -10 }}
              onClick={(e) => {
                e.preventDefault();
                Router.push(`/users/${record._id}`);
              }}
            >
              {record.email}
            </Button>
          </Link>
        </div>
      ),
    },

    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (text) => {
        switch (text) {
          case "admin":
            return "Admin";
          case "user":
            return "N.V Sale";
          default:
            return text;
        }
      },
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
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
      render: (text, record) => (
        <button
          onClick={() => toggleStatus(record._id, record.status)}
          disabled={loadingStatus[record._id] || record._id === currID}
          title={record._id === currID ? "Can't deactivate current user" : ""}
        >
          {loadingStatus[record._id]
            ? "Loading..."
            : record.status
            ? "Đang hoạt động"
            : "Đã bị khóa"}
        </button>
      ),
    },
  ];
  const filter = [
    { label: "Name", value: "name" },
    { label: "Email", value: "email" },
    { label: "Role", value: "role" },
    { label: "Phone", value: "phone" },
    { label: "Status", value: "status" },
  ];
  const statusOptions = [
    { value: "true", label: "Active" },
    { value: "false", label: "Inactive" },
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
  return (
    <>
      <Layout style={{ minHeight: "100vh" }}>
        <AppHeader />
        <Row>
          <Col xs={24} md={5} lg={4}>
            <AppSider role={role} />
          </Col>
          <Col
            xs={24}
            md={24}
            lg={20}
            style={{ width: "100%", minHeight: "100vh" }}
          >
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
                    User List
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
                      Create User
                    </Button>
                    <CreateForm
                      visible={showModal}
                      onClose={() => setShowModal(false)}
                      onSuccess={() => setOk(true)}
                    />
                  </div>
                </div>
                <FilterModal
                  onFilterApply={(newFilters) => {
                    setAppliedFilters(newFilters);
                    setPagination({ ...pagination, pageIndex: 1 });
                  }}
                  filterOptions={filter}
                  statusOptions={statusOptions}
                />
                <UserTable
                  key={Date.now()}
                  columns={columns}
                  data={data}
                  total={total}
                  loading={loading}
                  pagination={pagination}
                  setPagination={setPagination}
                />
              </div>
            </Content>
          </Col>
        </Row>
      </Layout>
    </>
  );
};

export default App;
