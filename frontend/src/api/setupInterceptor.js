import api from "./axios";

let refreshPromise = null;

export function refreshAccessTokenOnce() {
  if (!refreshPromise) {
    refreshPromise = api
      .post("/auth/refresh")
      .then((response) => {
        if (!response.data?.success || !response.data?.accessToken) {
          throw new Error("Unable to refresh the session");
        }

        return response.data.accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

export function setupInterceptors(
  getAccessToken,
  setAccessToken,
  onSessionExpired
) {
  const requestInterceptorId = api.interceptors.request.use((config) => {
    const accessToken = getAccessToken();

    if (accessToken) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  });

  const responseInterceptorId = api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      const status = error.response?.status;
      const url = originalRequest?.url || "";

      const isAuthEndpoint =
        url.includes("/auth/refresh") ||
        url.includes("/auth/login") ||
        url.includes("/auth/register") ||
        url.includes("/auth/logout");

      if (
        status !== 401 ||
        !originalRequest ||
        originalRequest._retry ||
        isAuthEndpoint
      ) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        const newAccessToken = await refreshAccessTokenOnce();

        setAccessToken(newAccessToken);

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization =
          `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        onSessionExpired();
        return Promise.reject(refreshError);
      }
    }
  );

  return {
    requestInterceptorId,
    responseInterceptorId,
  };
}
