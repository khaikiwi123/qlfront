import React from "react";
import { Layout, Menu } from "antd";
import { UsergroupAddOutlined, TeamOutlined } from "@ant-design/icons";
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
    case "/clients":
      selectedKey = "2";
      break;
    case "/users":
      selectedKey = "3";
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
        zIndex: 2,
      }}
    >
      <Menu theme="dark" selectedKeys={[selectedKey]} mode="inline">
        <SubMenu key="sub1" icon={<UsergroupAddOutlined />} title="Leads">
          <Menu.Item key="1" onClick={() => Router.push("/leads")}>
            List
          </Menu.Item>
        </SubMenu>
        <SubMenu key="sub2" icon={<UsergroupAddOutlined />} title="Clients">
          <Menu.Item key="2" onClick={() => Router.push("/clients")}>
            List
          </Menu.Item>
        </SubMenu>

        {role === "admin" && (
          <>
            <Menu.Item
              key="3"
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
