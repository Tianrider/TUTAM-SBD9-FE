import axios from "axios";

// Use environment variable if available, otherwise use default
const API_URL =
	import.meta.env.VITE_API_URL || "https://tutam-sbd-9-eta.vercel.app";

// Transaction interfaces
export interface Transaction {
	id: number;
	user_id: number;
	category_id: number;
	amount: number;
	description: string;
	date: string;
	created_at: string;
	category_name?: string;
	category_type?: string;
}

export interface TransactionCreateRequest {
	category_id: number;
	amount: number;
	description: string;
	date: string;
}

export interface TransactionUpdateRequest {
	category_id?: number;
	amount?: number;
	description?: string;
	date?: string;
}

export interface TransactionsQueryParams {
	limit?: number;
	offset?: number;
	start_date?: string;
	end_date?: string;
	category_id?: number;
	type?: string;
}

function TransactionAPI() {
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

	// Get all transactions with optional filters
	const getTransactions = async (params?: TransactionsQueryParams) => {
		const response = await api.get("/transactions", {params});
		return response.data.payload;
	};

	// Get a transaction by ID
	const getTransactionById = async (id: number) => {
		const response = await api.get(`/transactions/${id}`);
		return response.data.payload;
	};

	// Create a new transaction
	const createTransaction = async (transaction: TransactionCreateRequest) => {
		const response = await api.post("/transactions", transaction);
		return response.data.payload;
	};

	// Update a transaction
	const updateTransaction = async (
		id: number,
		transaction: TransactionUpdateRequest
	) => {
		const response = await api.put(`/transactions/${id}`, transaction);
		return response.data.payload;
	};

	// Delete a transaction
	const deleteTransaction = async (id: number) => {
		const response = await api.delete(`/transactions/${id}`);
		return response.data.payload;
	};

	return {
		getTransactions,
		getTransactionById,
		createTransaction,
		updateTransaction,
		deleteTransaction,
	};
}

export default TransactionAPI;
