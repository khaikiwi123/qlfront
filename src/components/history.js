import dayjs from "dayjs";
import { Timeline } from "antd";
import { translateStatus } from "@/Utils/translate";

const AppHistory = ({ changeLog }) => {
  return (
    <>
      <div
        style={{
          borderBottom: "1px solid #A9A9A9",
        }}
      >
        {changeLog.length > 0 ? (
          <Timeline mode="left" className="app-history-timeline">
            {changeLog.map((log, index) => {
              let message;

              if (log.field === "created") {
                message = `${log.changedBy} đã tạo lead này`;
              } else if (log.field === "product") {
                message = `${log.changedBy} đã thay đổi sản phẩm từ ${log.oldValue} sang ${log.newValue}`;
              } else if (log.field === "saleName") {
                message = `${log.changedBy} đã thay đổi người chịu trách nhiệm từ ${log.oldValue} sang ${log.newValue}`;
              } else if (log.field === "email") {
                message = `${log.changedBy} đã thay đổi email từ ${log.oldValue} sang ${log.newValue}`;
              } else if (log.field === "phone") {
                message = `${log.changedBy} đã thay đổi số điện thoại từ ${log.oldValue} sang ${log.newValue}`;
              } else if (log.field === "org") {
                message = `${log.changedBy} đã thay đổi tên tổ chức từ ${log.oldValue} sang ${log.newValue}`;
              } else if (log.field === "rep") {
                message = `${log.changedBy} đã thay đổi tên người đại diện từ ${log.oldValue} sang ${log.newValue}`;
              } else {
                message = `${
                  log.changedBy
                } đã thay đổi trạng thái từ ${translateStatus(
                  log.oldValue
                )} sang ${translateStatus(log.newValue)} sau ${
                  log.daysLastUp ? log.daysLastUp : "?"
                } ngày`;
              }

              return (
                <Timeline.Item
                  key={index}
                  label={
                    <span
                      style={
                        index !== changeLog.length - 1
                          ? { color: "gray", width: "auto" }
                          : { width: "auto" }
                      }
                    >
                      {dayjs(log.updatedAt).format("DD/MM/YYYY HH:mm")}
                    </span>
                  }
                  color={index !== changeLog.length - 1 ? "gray" : "green"}
                >
                  <span
                    style={
                      index !== changeLog.length - 1 ? { color: "gray" } : {}
                    }
                  >
                    {message}
                  </span>
                </Timeline.Item>
              );
            })}
          </Timeline>
        ) : (
          <p>Lịch sử trống</p>
        )}
      </div>
    </>
  );
};

export default AppHistory;
