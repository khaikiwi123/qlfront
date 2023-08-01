import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Router from "next/router";
import { UserOutlined } from "@ant-design/icons";
import { Layout, Menu, Table, Button, Input, Space } from "antd";
import api from "@/api/api";
import { SearchOutlined } from "@ant-design/icons";
import Highlighter from "react-highlight-words";
const { Header, Content, Footer, Sider } = Layout;

const App = () => {
  const [data, setData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [searchParams, setSearchParams] = useState([]);

  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState({});
  const [currID, setCurrID] = useState("");
  const [pagination, setPagination] = useState({
    pageIndex: 1,
    pageSize: 1,
  });

  const searchInput = useRef(null);

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchedColumn(dataIndex);
    setSearchParams((prevFilters) => [
      ...prevFilters,
      {
        id: dataIndex,
        value: selectedKeys[0],
      },
    ]);
  };

  const handleReset = (clearFilters, confirm, dataIndex) => {
    clearFilters();
    confirm();
    setSearchText("");
    setSearchParams((prevFilters) =>
      prevFilters.filter((filter) => filter.id !== dataIndex)
    );
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: "block",
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
            }}
          >
            Search
          </Button>
          <Button
            onClick={() =>
              clearFilters && handleReset(clearFilters, confirm, dataIndex)
            }
            size="small"
            style={{
              width: 90,
            }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? "#1677ff" : undefined,
        }}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{
            backgroundColor: "#ffc069",
            padding: 0,
          }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  useEffect(() => {
    setCurrID(localStorage.getItem("currID"));
    setLoading(true);
    const { pageIndex, pageSize } = pagination;

    let params = {};
    if (pageSize !== "All") {
      params = {
        pageNumber: pageIndex,
        pageSize: pageSize,
      };
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
      .get("/users/", { params })
      .then((res) => {
        setTotal(res.data.total);
        setData(res.data.users);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        console.error(error);
      });
  }, [pagination, searchParams]);

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

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      ...getColumnSearchProps("name"),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      ...getColumnSearchProps("email"),
      render: (text, record) => (
        <Link href={`/users/${record._id}`}>
          <Button
            type="link"
            color="neutral"
            size="sm"
            variant="plain"
            onClick={(e) => {
              e.preventDefault();
              Router.push(`/users/${record._id}`);
            }}
          >
            {record.email}
          </Button>
        </Link>
      ),
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      ...getColumnSearchProps("phone"),
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
          items={[UserOutlined].map((icon, index) => ({
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
                current: pagination.pageIndex,
                pageSize: pagination.pageSize,
                total: total,
                pageSizeOptions: ["1", "7"],
                showSizeChanger: true,
                onChange: (pageIndex, pageSize) => {
                  if (pageSize !== pagination.pageSize) {
                    // If the page size has changed, reset to the first page.
                    setPagination({
                      pageIndex: 1,
                      pageSize: pageSize,
                    });
                  } else {
                    // Otherwise, just update the current page number.
                    setPagination({
                      ...pagination,
                      pageIndex: pageIndex,
                    });
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
