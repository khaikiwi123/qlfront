import React from "react";
import { Layout, Menu, Dropdown, Avatar, Button } from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  ProfileOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import Router from "next/router";
import useLogout from "@/hooks/useLogout";

const { Header } = Layout;

const AppHeader = () => {
  const { logOut, loadingOut } = useLogout();

  const menu = (
    <Menu>
      <Menu.Item key="0">
        <Button type="text" onClick={() => Router.push("/home")}>
          <HomeOutlined /> Home
        </Button>
      </Menu.Item>
      <Menu.Item key="1">
        <Button type="text" onClick={() => Router.push("/profile")}>
          <ProfileOutlined /> Profile
        </Button>
      </Menu.Item>
      <Menu.Item key="2">
        <Button type="text" onClick={logOut} loading={loadingOut}>
          <LogoutOutlined /> Logout
        </Button>
      </Menu.Item>
    </Menu>
  );

  return (
    <Header
      style={{
        position: "fixed",
        left: 0, // Position it to the leftmost
        width: "100%",
        zIndex: 1, // Keep it under the Sider
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
  );
};

export default AppHeader;
