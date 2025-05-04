import axios from "axios";

// Use environment variable if available, otherwise use default
const API_URL =
	import.meta.env.VITE_API_URL || "https://tutam-sbd-9-eta.vercel.app";

// Category interfaces
export interface Category {
	id: number;
	user_id: number;
	name: string;
	type: "income" | "expense";
	created_at: string;
}

export interface CategoryCreateRequest {
	name: string;
	type: "income" | "expense";
}

export interface CategoryUpdateRequest {
	name?: string;
	type?: "income" | "expense";
}

function CategoryAPI() {
	// Create axios instance with base URL and default headers
	const api = axios.create({
		baseURL: API_URL + "/api",
		headers: {
			"Content-Type": "application/json",
		},
	});

	// Add authorization header from localStorage on every request
	api.interceptors.request.use((config) => {
		const token = localStorage.getItem("token");
		if (token) {
			config.headers["Authorization"] = `Bearer ${token}`;
		}
		return config;
	});

	// Get all categories
	const getCategories = async () => {
		const response = await api.get("/categories");
		return response.data.payload;
	};

	// Get categories by type (income/expense)
	const getCategoriesByType = async (type: "income" | "expense") => {
		const response = await api.get(`/categories?type=${type}`);
		return response.data.payload;
	};

	// Get a category by ID
	const getCategoryById = async (id: number) => {
		const response = await api.get(`/categories/${id}`);
		return response.data.payload;
	};

	// Create a new category
	const createCategory = async (category: CategoryCreateRequest) => {
		const response = await api.post("/categories", category);
		return response.data;
	};

	// Update a category
	const updateCategory = async (
		id: number,
		category: CategoryUpdateRequest
	) => {
		const response = await api.put(`/categories/${id}`, category);
		return response.data.payload;
	};

	// Delete a category
	const deleteCategory = async (id: number) => {
		const response = await api.delete(`/categories/${id}`);
		return response.data;
	};

	return {
		getCategories,
		getCategoriesByType,
		getCategoryById,
		createCategory,
		updateCategory,
		deleteCategory,
	};
}

export default CategoryAPI;
