import axios from "axios";

const api = axios.create({
  baseURL: "https://frohjobhl4.execute-api.ap-southeast-1.amazonaws.com/Prod",
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

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

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
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers["Authorization"] = "Bearer " + token;
              return api(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        return new Promise((resolve, reject) => {
          refreshToken()
            .then((token) => {
              originalRequest.headers["Authorization"] = "Bearer " + token;
              processQueue(null, token);
              resolve(api(originalRequest));
            })
            .catch((err) => {
              processQueue(err, null);
              reject(err);
            })
            .then(() => {
              isRefreshing = false;
            });
        });
      }
    }
    return Promise.reject(error);
  }
);

export default api;
