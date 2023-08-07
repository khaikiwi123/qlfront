import React from "react";
import { Layout, Menu } from "antd";
import {
  UsergroupAddOutlined,
  IdcardOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import Router, { useRouter } from "next/router";

const { Sider } = Layout;
const { SubMenu } = Menu;
const AppSider = ({ role }) => {
  const router = useRouter();
  let selectedKey;
  switch (router.pathname) {
    case "/clients/potential":
      selectedKey = "1";
      break;
    case "/clients/acquired":
      selectedKey = "2";
      break;
    case "/clients/all":
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
      width={200}
      style={{
        overflow: "auto",
        height: "100vh",
        position: "fixed",
        left: 0,
        zIndex: 2, // This will keep the Sider above the Header
      }}
    >
      <Menu theme="dark" selectedKeys={[selectedKey]} mode="inline">
        {role === "user" && (
          <SubMenu key="sub1" icon={<UsergroupAddOutlined />} title="Clients">
            <Menu.Item
              key="1"
              onClick={() => Router.push("/clients/potential")}
            >
              Potential
            </Menu.Item>
            <Menu.Item key="2" onClick={() => Router.push("/clients/acquired")}>
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
  );
};

export default AppSider;
