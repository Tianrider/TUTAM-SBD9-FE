import {useState, useEffect} from "react";
import {useLocation} from "react-router-dom";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../components/ui/card";
import {Button} from "../components/ui/button";
import {Input} from "../components/ui/input";
import {Search, Plus, Edit, Trash2, Filter} from "lucide-react";
import {toast} from "sonner";
import AddTransactionDialog from "../components/AddTransactionDialog";
import TransactionAPI, {
	Transaction,
	TransactionCreateRequest,
	TransactionUpdateRequest,
} from "../hooks/TransactionAPI";
import CategoryAPI, {Category} from "../hooks/CategoryAPI";
import {Skeleton} from "../components/ui/skeleton";
import axios from "axios";

export default function Transactions() {
	const location = useLocation();
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [categories, setCategories] = useState<Category[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [typeFilter, setTypeFilter] = useState("all");
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editingTransaction, setEditingTransaction] =
		useState<Transaction | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [showFilters, setShowFilters] = useState(false);

	const transactionApi = TransactionAPI();
	const categoryApi = CategoryAPI();

	// Fetch transactions and categories on component mount
	useEffect(() => {
		const fetchData = async () => {
			setIsLoading(true);
			setError(null);

			try {
				const transactionsData = await transactionApi.getTransactions();
				// Convert amount to number if it's a string
				const processedTransactions = transactionsData.map(
					(t: Transaction) => ({
						...t,
						amount:
							typeof t.amount === "string"
								? parseFloat(t.amount)
								: t.amount,
					})
				);
				setTransactions(processedTransactions);

				const categoriesData = await categoryApi.getCategories();
				setCategories(categoriesData);
			} catch (err) {
				if (axios.isAxiosError(err)) {
					setError(
						err.response?.data?.message || "Failed to fetch data"
					);
				} else {
					setError("An unexpected error occurred");
				}
				console.error("Error fetching data:", err);
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
	}, []);

	// Check if we need to open the dialog based on navigation state
	useEffect(() => {
		if (location.state?.openAddDialog) {
			setEditingTransaction(null);
			setIsDialogOpen(true);
		}
	}, [location.state]);

	// Filter functions
	const filteredTransactions = transactions.filter((transaction) => {
		const matchesSearch = transaction.description
			.toLowerCase()
			.includes(searchTerm.toLowerCase());

		const category = categories.find(
			(c) => c.id === transaction.category_id
		);
		const transactionType = category?.type || "";

		const matchesType =
			typeFilter === "all" || transactionType === typeFilter;

		return matchesSearch && matchesType;
	});

	const handleAddTransaction = async (
		transactionData: TransactionCreateRequest
	) => {
		try {
			if (editingTransaction) {
				// Update existing transaction
				const updatedTransaction =
					await transactionApi.updateTransaction(
						editingTransaction.id,
						transactionData as TransactionUpdateRequest
					);

				// Update local state
				setTransactions((prevTransactions) =>
					prevTransactions.map((t) =>
						t.id === updatedTransaction.id ? updatedTransaction : t
					)
				);

				toast.success("Transaction updated successfully");
			} else {
				// Add new transaction
				const newTransaction = await transactionApi.createTransaction(
					transactionData
				);

				// Update local state
				setTransactions((prevTransactions) => [
					...prevTransactions,
					newTransaction,
				]);

				toast.success("Transaction added successfully");
			}
		} catch (err) {
			if (axios.isAxiosError(err)) {
				toast.error(
					err.response?.data?.message ||
						"Error processing transaction"
				);
			} else {
				toast.error("An unexpected error occurred");
			}
			console.error("Transaction error:", err);
		}
	};

	const handleEdit = (transaction: Transaction) => {
		setEditingTransaction(transaction);
		setIsDialogOpen(true);
	};

	const handleDelete = async (id: number) => {
		try {
			await transactionApi.deleteTransaction(id);
			// Update local state
			setTransactions((prevTransactions) =>
				prevTransactions.filter((transaction) => transaction.id !== id)
			);
			toast.success("Transaction deleted successfully");
		} catch (err) {
			if (axios.isAxiosError(err)) {
				toast.error(
					err.response?.data?.message || "Error deleting transaction"
				);
			} else {
				toast.error("An unexpected error occurred");
			}
			console.error("Delete error:", err);
		}
	};

	// Helper to get category name
	const getCategoryName = (categoryId: number) => {
		const category = categories.find((c) => c.id === categoryId);
		return category?.name || "Unknown";
	};

	// Helper to get category type
	const getCategoryType = (categoryId: number) => {
		const category = categories.find((c) => c.id === categoryId);
		return category?.type || "expense";
	};

	return (
		<div className="space-y-6">
			{/* Mobile Search & Filters */}
			<div className="flex flex-col gap-4 md:hidden">
				<div className="flex items-center justify-between">
					<div className="relative flex-1">
						<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
						<Input
							placeholder="Search..."
							className="pl-8"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</div>
					<Button
						variant="outline"
						size="icon"
						className="ml-2"
						onClick={() => setShowFilters(!showFilters)}
					>
						<Filter className="h-4 w-4" />
					</Button>
				</div>

				{showFilters && (
					<div className="flex flex-col gap-2 p-4 bg-white rounded-md shadow-sm border dark:bg-slate-800 dark:border-slate-700">
						<div className="flex items-center justify-between">
							<span className="text-sm font-medium">
								Filter by type:
							</span>
							<select
								className="flex h-9 w-28 rounded-md border border-input px-3 py-1 text-sm"
								value={typeFilter}
								onChange={(e) => setTypeFilter(e.target.value)}
							>
								<option value="all">All</option>
								<option value="income">Income</option>
								<option value="expense">Expense</option>
							</select>
						</div>
					</div>
				)}

				<Button
					className="flex items-center gap-1 w-full"
					onClick={() => {
						setEditingTransaction(null);
						setIsDialogOpen(true);
					}}
				>
					<Plus className="h-4 w-4" />
					Add Transaction
				</Button>
			</div>

			{/* Desktop Filters */}
			<div className="hidden md:flex md:flex-row md:justify-between md:items-center gap-4">
				<div className="flex flex-1 gap-4 items-center">
					<div className="relative w-full md:w-80">
						<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
						<Input
							placeholder="Search transactions..."
							className="pl-8"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</div>
					<select
						className="flex h-10 w-32 rounded-md border border-input px-3 py-2 text-sm"
						value={typeFilter}
						onChange={(e) => setTypeFilter(e.target.value)}
					>
						<option value="all">All</option>
						<option value="income">Income</option>
						<option value="expense">Expense</option>
					</select>
				</div>
				<Button
					className="flex shrink-0 items-center gap-1"
					onClick={() => {
						setEditingTransaction(null);
						setIsDialogOpen(true);
					}}
				>
					<Plus className="h-4 w-4" />
					Add Transaction
				</Button>
			</div>

			{/* Add Transaction Dialog */}
			<AddTransactionDialog
				isOpen={isDialogOpen}
				onOpenChange={setIsDialogOpen}
				onAddTransaction={handleAddTransaction}
				editTransaction={editingTransaction}
				categories={categories}
			/>

			<Card>
				<CardHeader>
					<CardTitle>Transactions</CardTitle>
					<CardDescription>
						{isLoading
							? "Loading transactions..."
							: error
							? `Error: ${error}`
							: `${filteredTransactions.length} transaction${
									filteredTransactions.length !== 1 ? "s" : ""
							  } found`}
					</CardDescription>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="space-y-4">
							{Array(5)
								.fill(0)
								.map((_, i) => (
									<div
										key={i}
										className="flex flex-col md:flex-row md:items-center md:justify-between border-b pb-2 space-y-2 md:space-y-0 pt-2"
									>
										<div className="flex items-center space-x-4">
											<Skeleton className="h-10 w-10 rounded-full" />
											<div className="space-y-2">
												<Skeleton className="h-4 w-40" />
												<Skeleton className="h-3 w-24" />
											</div>
										</div>
										<div className="flex items-center justify-between md:justify-end space-x-4 pl-14 md:pl-0">
											<Skeleton className="h-4 w-16" />
											<div className="flex items-center space-x-2">
												<Skeleton className="h-8 w-8 rounded-md" />
												<Skeleton className="h-8 w-8 rounded-md" />
											</div>
										</div>
									</div>
								))}
						</div>
					) : error ? (
						<div className="flex flex-col items-center justify-center py-10 text-center">
							<p className="text-lg font-medium text-red-500">
								{error}
							</p>
							<p className="text-sm text-slate-500">
								Please try again later
							</p>
						</div>
					) : (
						<div className="space-y-2">
							{filteredTransactions.length > 0 ? (
								filteredTransactions.map((transaction) => (
									<div
										key={transaction.id}
										className="flex flex-col md:flex-row md:items-center md:justify-between border-b pb-2 last:border-0 space-y-2 md:space-y-0 pt-2"
									>
										<div className="flex items-center space-x-4">
											<div
												className={`h-10 w-10 rounded-full flex items-center justify-center ${
													getCategoryType(
														transaction.category_id
													) === "expense"
														? "bg-red-100"
														: "bg-green-100"
												}`}
											>
												<span
													className={
														getCategoryType(
															transaction.category_id
														) === "expense"
															? "text-red-500"
															: "text-green-500"
													}
												>
													{getCategoryType(
														transaction.category_id
													) === "expense"
														? "-"
														: "+"}
												</span>
											</div>
											<div>
												<p className="font-medium">
													{transaction.description}
												</p>
												<div className="flex space-x-2 text-sm text-slate-500">
													<span>
														{getCategoryName(
															transaction.category_id
														)}
													</span>
													<span>•</span>
													<span>
														{transaction.date}
													</span>
												</div>
											</div>
										</div>
										<div className="flex items-center justify-between md:justify-end space-x-4 pl-14 md:pl-0">
											<p
												className={`font-medium ${
													getCategoryType(
														transaction.category_id
													) === "expense"
														? "text-red-500"
														: "text-green-500"
												}`}
											>
												{getCategoryType(
													transaction.category_id
												) === "expense"
													? "-"
													: "+"}
												${transaction.amount}
											</p>
											<div className="flex items-center space-x-2">
												<Button
													variant="ghost"
													size="icon"
													onClick={() =>
														handleEdit(transaction)
													}
												>
													<Edit className="h-4 w-4" />
												</Button>
												<Button
													variant="ghost"
													size="icon"
													onClick={() =>
														handleDelete(
															transaction.id
														)
													}
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</div>
										</div>
									</div>
								))
							) : (
								<div className="flex flex-col items-center justify-center py-10 text-center">
									<p className="text-lg font-medium">
										No transactions found
									</p>
									<p className="text-sm text-slate-500">
										{searchTerm || typeFilter !== "all"
											? "Try adjusting your filters"
											: "Add your first transaction using the button above"}
									</p>
								</div>
							)}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
