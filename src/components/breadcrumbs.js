import { Breadcrumb } from "antd";
import Link from "next/link";

const AppCrumbs = ({ paths }) => {
  return (
    <Breadcrumb style={{ margin: "16px 0" }}>
      {paths.map((path, index) => (
        <Breadcrumb.Item key={index}>
          {path.href ? <Link href={path.href}>{path.name}</Link> : path.name}
        </Breadcrumb.Item>
      ))}
    </Breadcrumb>
  );
};

export default AppCrumbs;
