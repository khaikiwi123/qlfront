export const statusTranslations = {
  "No contact": "Chưa liên hệ",
  "In contact": "Đã liên hệ",
  "Verified needs": "Đã xác định nhu cầu",
  Consulted: "Đã tư vấn",
  Success: "Thành công",
  Failed: "Thất bại",
};

export function translateStatus(status) {
  return statusTranslations[status] || status;
}
