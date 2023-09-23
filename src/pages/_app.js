import "../style/global.css";
import { ConfigProvider } from "antd";
import viVN from "antd/locale/vi_VN";
import { UserProvider } from "@/context/context";

export default function App({ Component, pageProps }) {
  return (
    <ConfigProvider locale={viVN}>
      <UserProvider>
        <Component {...pageProps} />
      </UserProvider>
    </ConfigProvider>
  );
}
