import React, { useEffect, useState } from "react";
import {
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import { Layout, Menu, Table } from "antd";
import api from "@/api/api";
const { Header, Content, Footer, Sider } = Layout;

const App = () => {
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
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
    },
    {
      title: "Created Date",
      dataIndex: "createdDate",
      key: "createdDate",
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
            ? "Active"
            : "Inactive"}
        </button>
      ),
    },
  ];
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState({});
  const [currID, setCurrID] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 1,
  });

  const fetchData = async (params = {}) => {
    setLoading(true);
    const { current, pageSize } = params;
    let endpoint = "/users";
    let actualPageSize = pageSize;

    if (pageSize === "All") {
      actualPageSize = total; // Use the total number of records when 'All' is selected
      endpoint += `?pageNumber=${current}&pageSize=${actualPageSize}`;
    } else if (pageSize && pageSize !== "All") {
      endpoint += `?pageNumber=${current}&pageSize=${pageSize}`;
    }

    const res = await api.get(endpoint);
    setData(res.data.users);
    setTotal(res.data.total || 0);
    setLoading(false);
  };
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
    fetchData(pagination);
    setCurrID(localStorage.getItem("currID"));
  }, [pagination, total]);
  return (
    <Layout>
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        onBreakpoint={(broken) => {
          console.log(broken);
        }}
        onCollapse={(collapsed, type) => {
          console.log(collapsed, type);
        }}
      >
        <div className="demo-logo-vertical" />
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["4"]}
          items={[
            UserOutlined,
            VideoCameraOutlined,
            UploadOutlined,
            UserOutlined,
          ].map((icon, index) => ({
            key: String(index + 1),
            icon: React.createElement(icon),
            label: `nav ${index + 1}`,
          }))}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: 0,
          }}
        />
        <Content
          style={{
            margin: "24px 16px 0",
          }}
        >
          <div
            style={{
              padding: 24,
              minHeight: 360,
            }}
          >
            <Table
              columns={columns}
              dataSource={data}
              loading={loading}
              rowKey="email"
              pagination={{
                ...pagination,
                total: total,
                pageSizeOptions: ["1", "2", "All"],
                showSizeChanger: true,
                onChange: (current, size) => {
                  if (size === "All") {
                    setPagination({ current: 1, pageSize: total });
                  } else if (size !== pagination.pageSize) {
                    setPagination({ current: 1, pageSize: parseInt(size, 10) });
                  } else {
                    setPagination((prev) => ({ ...prev, current }));
                  }
                },
              }}
            />
          </div>
        </Content>
        <Footer
          style={{
            textAlign: "center",
          }}
        >
          Ant Design ©2023 Created by Ant UED
        </Footer>
      </Layout>
    </Layout>
  );
};

export default App;
