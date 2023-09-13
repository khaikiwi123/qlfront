import React from "react";
import { Layout, Menu, Dropdown, Avatar, Button } from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  ProfileOutlined,
} from "@ant-design/icons";
import Router from "next/router";
import useLogout from "@/hooks/useLogout";

const { Header } = Layout;

const AppHeader = () => {
  const { logOut, loadingOut } = useLogout();

  const menu = (
    <Menu>
      <Menu.Item key="0">
        <Button type="text" onClick={() => Router.push("/profile")}>
          <ProfileOutlined /> Trang cá nhân
        </Button>
      </Menu.Item>
      <Menu.Item key="1">
        <Button type="text" onClick={logOut} loading={loadingOut}>
          <LogoutOutlined /> Đăng xuất
        </Button>
      </Menu.Item>
    </Menu>
  );

  return (
    <Header
      style={{
        position: "fixed",
        left: 0,
        width: "100%",
        zIndex: 1,
        padding: 0,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <img
        src="https://w.ladicdn.com/s550x350/60c6df75a65e92002c16b379/logo-intro-20221103032359-an-0c.png"
        alt="Logo"
        style={{
          marginLeft: "30px",
          height: "30px",
        }}
      />

      <Dropdown overlay={menu} trigger={["click"]}>
        <Avatar
          style={{ backgroundColor: "#87d068", marginRight: "15px" }}
          icon={<UserOutlined />}
        />
      </Dropdown>
    </Header>
  );
};

export default AppHeader;
