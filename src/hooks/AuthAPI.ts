import axios from "axios";

// Use environment variable if available, otherwise use default
const API_URL =
	import.meta.env.VITE_API_URL || "https://tutam-sbd-9-eta.vercel.app";

console.log("API_URL:", API_URL);

interface LoginCredentials {
	email: string;
	password: string;
}

interface RegisterCredentials {
	username: string;
	email: string;
	password: string;
}

interface AuthResponse {
	user: {
		id: string;
		username: string;
		email: string;
	};
	token: string;
}

function AuthAPI() {
	const api = axios.create({
		baseURL: API_URL + "/api",
		headers: {
			"Content-Type": "application/json",
		},
	});

	const setAuthToken = (token: string | null) => {
		if (token) {
			api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
			localStorage.setItem("token", token);
		} else {
			delete api.defaults.headers.common["Authorization"];
		}
	};

	const initializeAuth = () => {
		const token = localStorage.getItem("token");
		if (token) {
			setAuthToken(token);
			return true;
		}
		return false;
	};

	const login = async (
		credentials: LoginCredentials
	): Promise<AuthResponse> => {
		const response = await api.post("/users/login", credentials);
		const {user, token} = response.data.payload;
		setAuthToken(token);
		return {user, token};
	};

	const register = async (
		credentials: RegisterCredentials
	): Promise<AuthResponse> => {
		const response = await api.post("/users/register", credentials);
		const {user, token} = response.data.payload;
		setAuthToken(token);
		return {user, token};
	};

	const logout = () => {
		setAuthToken(null);
		localStorage.removeItem("token");
	};

	const getCurrentUser = async () => {
		try {
			const response = await api.get("/users/validate-token");
			console.log(response.data.payload);
			return response.data.payload;
		} catch (error) {
			setAuthToken(null);
			throw error;
		}
	};

	return {
		login,
		register,
		logout,
		getCurrentUser,
		setAuthToken,
		initializeAuth,
	};
}

export default AuthAPI;
