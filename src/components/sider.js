import React from "react";
import { Layout, Menu } from "antd";
import {
  UsergroupAddOutlined,
  TeamOutlined,
  DollarCircleOutlined,
  FunnelPlotOutlined,
  SolutionOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/router";
import Link from "next/link";
const { Sider } = Layout;
const { SubMenu } = Menu;
const AppSider = ({ role }) => {
  const router = useRouter();
  let selectedKey;
  switch (router.pathname) {
    case "/leads":
      selectedKey = "1";
      break;
    case "/customers":
      selectedKey = "2";
      break;
    case "/products":
      selectedKey = "3";
      break;
    case "/bills":
      selectedKey = "4";
      break;
    case "/users":
      selectedKey = "5";
      break;
    default:
      selectedKey = "1";
  }
  return (
    <Sider
      breakpoint="lg"
      collapsedWidth="0"
      onBreakpoint={(broken) => {
        console.log(broken);
      }}
      onCollapse={(collapsed, type) => {
        console.log(collapsed, type);
      }}
      style={{
        marginTop: 64,
        height: "100%",
        position: "fixed",
        left: 0,
        zIndex: 3,
      }}
    >
      <Menu theme="dark" selectedKeys={[selectedKey]} mode="inline">
        <SubMenu key="sub1" icon={<FunnelPlotOutlined />} title="Leads">
          <Link href="/leads">
            <Menu.Item key="1" style={{ color: "rgba(255, 255, 255, 0.65)" }}>
              Danh sách
            </Menu.Item>
          </Link>
        </SubMenu>
        <SubMenu key="sub2" icon={<UsergroupAddOutlined />} title="Khách hàng">
          <Link href="/customers">
            <Menu.Item key="2" style={{ color: "rgba(255, 255, 255, 0.65)" }}>
              Danh sách
            </Menu.Item>
          </Link>
        </SubMenu>
        <SubMenu key="sub3" icon={<DollarCircleOutlined />} title="Sản phẩm">
          <Link href="/products">
            <Menu.Item key="3" style={{ color: "rgba(255, 255, 255, 0.65)" }}>
              Danh sách
            </Menu.Item>
          </Link>
        </SubMenu>
        <SubMenu key="sub4" icon={<SolutionOutlined />} title="Bill">
          <Link href="/bills">
            <Menu.Item key="4" style={{ color: "rgba(255, 255, 255, 0.65)" }}>
              Danh sách
            </Menu.Item>
          </Link>
        </SubMenu>

        {role === "admin" && (
          <SubMenu key="sub5" icon={<TeamOutlined />} title="User">
            <Link href="/users">
              <Menu.Item key="5" style={{ color: "rgba(255, 255, 255, 0.65)" }}>
                Người dùng
              </Menu.Item>
            </Link>
          </SubMenu>
        )}
      </Menu>
    </Sider>
  );
};

export default AppSider;
