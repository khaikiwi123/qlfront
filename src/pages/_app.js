import "../style/global.css";
import { ConfigProvider } from "antd";
import viVN from "antd/locale/vi_VN";

export default function App({ Component, pageProps }) {
  return (
    <ConfigProvider locale={viVN}>
      <Component {...pageProps} />
    </ConfigProvider>
  );
}
