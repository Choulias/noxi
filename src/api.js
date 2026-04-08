import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000"
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const url = error.config?.url || "";
        const isAuthRoute = url.includes("/users/login") || (url.includes("/users") && error.config?.method === "post");
        if (error.response?.status === 401 && !isAuthRoute) {
            // Token expire : on le supprime mais on ne redirige que si on est sur une page protegee
            localStorage.removeItem("token");
            const publicPaths = ['/', '/games', '/events', '/players', '/support', '/login', '/signup'];
            const currentPath = window.location.pathname;
            const isPublicPage = publicPaths.some(p => currentPath === p)
                || currentPath.startsWith('/events/')
                || currentPath.startsWith('/profile/')
                || currentPath.startsWith('/tictactoe/')
                || currentPath.startsWith('/mascarade/');
            if (!isPublicPage) {
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export default api;
