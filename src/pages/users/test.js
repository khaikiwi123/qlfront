import React, { useEffect, useState } from 'react';
import { UploadOutlined, UserOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { Layout, Menu, Table } from 'antd';
import {Button} from 'antd';
import api from '@/api/api';
const { Header, Content, Footer, Sider } = Layout;


const App = () => {
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      filters: [
        { text: 'Admin', value: 'admin' },
        { text: 'User', value: 'user' },
        { text: 'All', value: 'all' },
      ],
      onFilter: (value, record) => value === 'all' || record.role.indexOf(value) === 0,
    },
    {
      title: 'Created Date',
      dataIndex: 'createdDate',
      key: 'createdDate',
    },
    {
      title: 'Action',
      key: 'action',
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
      filters: [
        { text: 'Active', value: 'true' },
        { text: 'Inactive', value: 'false' },
        { text: 'All', value: 'all' },
      ],
      onFilter: (value, record) => value === 'all' || String(record.status) === value,
    }
  ];
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState({});
  const [currID, setCurrID] = useState("");
  const [filters, setFilters] = useState({});

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 1,
  });

  const fetchData = async (pagination) => {
    setLoading(true);
    let { current: pageIndex, pageSize } = pagination;
    let params = {};
  
    if (pageSize !== "All") {
      params = {
          pageNumber: pageIndex + 1,
          pageSize: pageSize,
      };
    }
  
    params = {
      ...params,
      ...filters,
    };
  
    const res = await api.get("/users/", { params });
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
    fetchData(pagination, {});
    setCurrID(localStorage.getItem("currID"))
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
          defaultSelectedKeys={['4']}
          items={[UserOutlined, VideoCameraOutlined, UploadOutlined, UserOutlined].map(
            (icon, index) => ({
              key: String(index + 1),
              icon: React.createElement(icon),
              label: `nav ${index + 1}`,
            }),
          )}
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
            margin: '24px 16px 0',
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
        pageSizeOptions: ['1', '2', 'All'],
        showSizeChanger: true,
        onChange: (current, size) => {
          if (size === 'All') {
            setPagination({ current: 1, pageSize: total });
          } else if (size !== pagination.pageSize) {
            setPagination({ current: 1, pageSize: parseInt(size, 10) });
          } else {
            setPagination(prev => ({ ...prev, current }));
          }
        },
      }}
      onChange={(pagination, newFilters, sorter, extra) => {
        // Only update filters when they actually change, not on pagination changes
        if (extra.action === 'filter') {
          setFilters(Object.entries(newFilters).reduce((acc, [key, value]) => {
            if (value && value[0] !== "all") {
              acc[key] = value[0];
            }
            return acc;
          }, {}));
        }
        
        fetchData(pagination);
      }}
    />
          </div>
        </Content>
        <Footer
          style={{
            textAlign: 'center',
          }}
        >
          Ant Design ©2023 Created by Ant UED
        </Footer>
      </Layout>
    </Layout>
  );
};

export default App;
