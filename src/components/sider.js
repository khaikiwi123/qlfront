import React from "react";
import { Layout, Menu } from "antd";
import {
  UsergroupAddOutlined,
  TeamOutlined,
  DollarCircleOutlined,
  FunnelPlotOutlined,
} from "@ant-design/icons";
import Router, { useRouter } from "next/router";

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
    case "/users":
      selectedKey = "4";
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
          <Menu.Item key="1" onClick={() => Router.push("/leads")}>
            Danh sách
          </Menu.Item>
        </SubMenu>
        <SubMenu key="sub2" icon={<UsergroupAddOutlined />} title="Khách hàng">
          <Menu.Item key="2" onClick={() => Router.push("/customers")}>
            Danh sách
          </Menu.Item>
        </SubMenu>
        <SubMenu key="sub3" icon={<DollarCircleOutlined />} title="Sản phẩm">
          <Menu.Item key="3" onClick={() => Router.push("/products")}>
            Danh sách
          </Menu.Item>
        </SubMenu>

        {role === "admin" && (
          <>
            <Menu.Item
              key="4"
              icon={<TeamOutlined />}
              onClick={() => Router.push("/users")}
            >
              Người dùng
            </Menu.Item>
          </>
        )}
      </Menu>
    </Sider>
  );
};

export default AppSider;
