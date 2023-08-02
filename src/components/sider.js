import React from "react";
import { Layout, Menu } from "antd";
import {
  UsergroupAddOutlined,
  IdcardOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import Router from "next/router";

const { Sider } = Layout;
const { SubMenu } = Menu;
const AppSider = ({ role }) => {
  return (
    <Sider>
      <Menu theme="dark" defaultSelectedKeys={["1"]} mode="inline">
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
