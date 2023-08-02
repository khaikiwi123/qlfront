import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Router from "next/router";
import {
  UserOutlined,
  SearchOutlined,
  LogoutOutlined,
  ProfileOutlined,
  TeamOutlined,
  IdcardOutlined,
  UsergroupAddOutlined,
} from "@ant-design/icons";
import {
  Layout,
  Table,
  Button,
  Input,
  Space,
  Menu,
  Dropdown,
  Avatar,
} from "antd";
import api from "@/api/api";
import Highlighter from "react-highlight-words";
import useLogout from "@/hooks/useLogout";
const { SubMenu } = Menu;
const { Header, Content, Sider } = Layout;
const App = () => {
  const [data, setData] = useState([]);
  const [searchParams, setSearchParams] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState({});
  const [searchedColumn, setSearchedColumn] = useState("");
  const [searchText, setSearchText] = useState("");
  const [currID, setCurrID] = useState("");
  const [role, setRole] = useState("");
  const [pagination, setPagination] = useState({
    pageIndex: 1,
    pageSize: 1,
  });
  const searchInput = useRef(null);
  const { logOut, loadingOut } = useLogout();
  useEffect(() => {
    setRole(localStorage.getItem("role"));
  }, []);
  const menu = (
    <Menu>
      <Menu.Item key="0">
        <Button type="text" onClick={() => Router.push("/profile")}>
          <ProfileOutlined /> Profile
        </Button>
      </Menu.Item>
      <Menu.Item key="1">
        <Button type="text" onClick={logOut} loading={loadingOut}>
          <LogoutOutlined /> Logout
        </Button>
      </Menu.Item>
    </Menu>
  );
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchedColumn(dataIndex);
    setSearchText(selectedKeys[0]);
    setSearchParams((prevFilters) => {
      const index = prevFilters.findIndex((o) => o.id === dataIndex);
      if (index === -1) {
        return [...prevFilters, { id: dataIndex, value: selectedKeys[0] }];
      }
      prevFilters[index].value = selectedKeys[0];
      return [...prevFilters];
    });
  };

  const handleReset = (clearFilters, confirm, dataIndex) => {
    clearFilters();
    confirm();
    setSearchedColumn("");
    setSearchText("");
    setSearchParams((prevFilters) => {
      const newFilters = prevFilters.filter(
        (filter) => filter.id !== dataIndex
      );
      return newFilters;
    });
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
  const clearAllFilters = () => {
    setSearchText("");

    setSearchParams([]);
  };
  const handleTableChange = (pagination, filters) => {
    let newSearchParams = [];
    for (let prop in filters) {
      if (filters[prop] && filters[prop].length > 0) {
        newSearchParams.push({ id: prop, value: filters[prop][0] });
      }
    }
    setSearchParams(newSearchParams);
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
            onClick={() => {
              clearFilters && handleReset(clearFilters, confirm, dataIndex);
            }}
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
      filterMultiple: false,
      filters: [
        { text: "Admin", value: "admin" },
        { text: "User", value: "user" },
      ],
      onFilter: (value, record) => record.role.indexOf(value) === 0,
      filteredValue: searchParams.find((o) => o.id === "role")
        ? [searchParams.find((o) => o.id === "role").value]
        : [],
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
      filterMultiple: false,
      filters: [
        { text: "Active", value: true },
        { text: "Inactive", value: false },
      ],
      onFilter: (value, record) => record.status === value,
      filteredValue: searchParams.find((o) => o.id === "status")
        ? [searchParams.find((o) => o.id === "status").value]
        : [],
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
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          padding: 0,
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
        }}
      >
        <Dropdown overlay={menu} trigger={["click"]}>
          <Avatar
            style={{ backgroundColor: "#87d068" }}
            icon={<UserOutlined />}
          />
        </Dropdown>
      </Header>
      <Layout>
        <Sider>
          <Menu theme="dark" defaultSelectedKeys={["1"]} mode="inline">
            {role === "user" && (
              <SubMenu
                key="sub1"
                icon={<UsergroupAddOutlined />}
                title="Clients"
              >
                <Menu.Item
                  key="1"
                  onClick={() => Router.push("/clients/potential")}
                >
                  Potential
                </Menu.Item>
                <Menu.Item
                  key="2"
                  onClick={() => Router.push("/clients/acquired")}
                >
                  Acquired
                </Menu.Item>
              </SubMenu>
            )}
            {role === "admin" && (
              <>
                <Menu.Item
                  key="3"
                  icon={<IdcardOutlined />}
                  onClick={() => Router.push("/clients/all")}
                >
                  Clients
                </Menu.Item>
                <Menu.Item
                  key="4"
                  icon={<TeamOutlined />}
                  onClick={() => Router.push("/users")}
                >
                  Users
                </Menu.Item>
              </>
            )}
          </Menu>
        </Sider>
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
              <h1 style={{ fontSize: "2em" }}>User List</h1>
              <Button onClick={clearAllFilters}>Clear All Filters</Button>
            </div>
            <Table
              columns={columns}
              dataSource={data}
              loading={loading}
              rowKey="email"
              onChange={handleTableChange}
              pagination={{
                current: pagination.pageIndex,
                pageSize: pagination.pageSize,
                total: total,
                pageSizeOptions: ["1", "7"],
                showSizeChanger: true,
                showLessItems: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} items`,
                onChange: (pageIndex, pageSize) => {
                  if (pageSize !== pagination.pageSize) {
                    setPagination({
                      pageIndex: 1,
                      pageSize: pageSize,
                    });
                  } else {
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
      </Layout>
    </Layout>
  );
};

export default App;
