import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Layout, Button, Modal } from "antd";
import api from "@/api/api";
import useLogout from "@/hooks/useLogout";
import useColumnSearch from "@/hooks/useColumnSearch";
import AppHeader from "@/components/header";
import AppSider from "@/components/sider";
import UserTable from "@/components/table";
import format from "date-fns/format";
import checkLogin from "@/Utils/checkLogin";
const { Content } = Layout;

const ProtectedPage = () => {
  const router = useRouter();
  const [clients, setClients] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isSet, setIsSet] = useState(false);
  const [role, setRole] = useState("");
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
  } = useColumnSearch();

  useEffect(() => {
    const loggedIn = localStorage.getItem("logged_in");
    if (loggedIn !== "true") {
      checkLogin();
      return;
    }
    if (!router.isReady) return;

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

    api
      .get("/clients/", { params })
      .then((res) => {
        setTotal(res.data.total);
        setClients(res.data.clients);
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
              okText: "Go back to lead",
              cancelText: "Logout",
              onOk() {
                router.push("/leads");
              },
              onCancel() {
                logOut();
              },
            });
          } else {
            Modal.error({
              title: "An error occurred",
              content: error.response.data.message || "Please try again later",
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
  }, [pagination, searchParams, router.isReady]);

  let baseColumns = [
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
      filteredValue: router.query.email ? [router.query.email] : null,
      ...getColumnSearchProps("email", handleSearch, handleReset),
    },
    {
      title: "Organization",
      dataIndex: "org",
      key: "org",
      ...getColumnSearchProps("org", handleSearch, handleReset),
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
  ];
  if (role === "admin") {
    baseColumns.push({
      title: "In Charge",
      dataIndex: "inCharge",
      key: "inCharge",
      ...getColumnSearchProps("inCharge", handleSearch, handleReset),
    });
  }

  const columns = baseColumns;
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
                  Accquired Clients List
                </h1>
                <div>
                  <Button onClick={clearAllFilters}>Clear All Filters</Button>
                </div>
              </div>
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
