import { Breadcrumb } from "antd";
import Link from "next/link";
import { LeftOutlined } from "@ant-design/icons";

const AppCrumbs = ({ paths }) => {
  if (paths.length === 1) {
    return (
      <div style={{ margin: "16px 0" }}>
        <Link href={paths[0].href}>
          <LeftOutlined style={{ color: "black" }} />
          <span style={{ color: "black" }}>{paths[0].name}</span>
        </Link>
      </div>
    );
  }

  return (
    <Breadcrumb separator=">" style={{ margin: "16px 0" }}>
      {paths.map((path, index) => (
        <Breadcrumb.Item key={index}>
          {path.href ? <Link href={path.href}>{path.name}</Link> : path.name}
        </Breadcrumb.Item>
      ))}
    </Breadcrumb>
  );
};

export default AppCrumbs;
