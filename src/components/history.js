import dayjs from "dayjs";
import { Timeline, Row, Col } from "antd";
import { translateStatus } from "@/Utils/translate";

const AppHistory = ({ changeLog }) => {
  return (
    <>
      <div
        style={{
          borderTop: "1px solid #A9A9A9",
          borderBottom: "1px solid #A9A9A9",
          borderRadius: "4px",
        }}
      >
        {changeLog.length > 0 ? (
          <Row key="history" style={{ width: "100%", marginTop: 20 }}>
            <Col>
              <Timeline
                className="timeline-responsive"
                style={{ textAlign: "left", marginTop: 0 }}
                mode="left"
              >
                {changeLog.map((log, index) => (
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
                      {log.field === "created"
                        ? `${log.changedBy} đã tạo lead này`
                        : `${
                            log.changedBy
                          } đã thay đổi trạng thái từ ${translateStatus(
                            log.oldValue
                          )} sang ${translateStatus(log.newValue)} sau ${
                            log.daysLastUp ? log.daysLastUp : "?"
                          } ngày`}
                    </span>
                  </Timeline.Item>
                ))}
              </Timeline>
            </Col>
          </Row>
        ) : (
          <p>History is empty</p>
        )}
      </div>
    </>
  );
};

export default AppHistory;
