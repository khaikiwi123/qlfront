import dayjs from "dayjs";

import { Timeline } from "antd";

import { translateStatus } from "@/Utils/translate";

const AppHistory = ({ changeLog }) => {
  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "self-start",
          overflowY: "auto",
          border: "1px solid #d9d9d9",
          borderRadius: "4px",
          padding: "8px",
        }}
      >
        {changeLog.length > 0 ? (
          <Timeline
            className="timeline-responsive"
            style={{ textAlign: "left", marginTop: 0 }}
            mode="left"
            reverse="true"
          >
            {changeLog.map((log, index) => (
              <Timeline.Item
                key={index}
                label={
                  <span
                    style={
                      index !== changeLog.length - 1 ? { color: "gray" } : {}
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
                  {log.changedBy} đã thay đổi trạng thái từ{" "}
                  {translateStatus(log.oldValue)} sang{" "}
                  {translateStatus(log.newValue)} sau{" "}
                  {log.daysLastUp ? log.daysLastUp : "?"} ngày
                </span>
              </Timeline.Item>
            ))}
          </Timeline>
        ) : (
          <p>History is empty</p>
        )}
      </div>
    </>
  );
};

export default AppHistory;
