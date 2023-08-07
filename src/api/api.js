import axios from "axios";

const api = axios.create({
  baseURL: "https://83vr7x9yp1.execute-api.ap-southeast-2.amazonaws.com/Prod",
});

export async function refreshToken() {
  const rToken = localStorage.getItem("refresh_token");
  const aToken = localStorage.getItem("access_token");
  localStorage.removeItem("access_token");

  try {
    const response = await api.post(
      "/auth/refresh",
      {},
      {
        headers: {
          Authorization: `Bearer ${rToken}`,
        },
      }
    );

    const { access, refresh } = response.data;
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);

    return access;
  } catch (error) {
    console.error("Error refreshing token:", error);
    localStorage.setItem("access_token", aToken);
    throw error;
  }
}

api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers["Authorization"] = "Bearer " + token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response) {
      const originalRequest = error.config;
      if (originalRequest.url === "/auth/refresh") {
        return Promise.reject(error);
      }
      if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const access_token = await refreshToken();
          originalRequest.headers["Authorization"] = "Bearer " + access_token;
          return api(originalRequest);
        } catch (refreshError) {
          console.error("Failed to refresh token:", refreshError);
          return Promise.reject(refreshError);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
