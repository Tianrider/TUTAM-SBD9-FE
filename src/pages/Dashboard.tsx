import {useState, useEffect} from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../components/ui/card";
import {Button} from "../components/ui/button";
import {Plus} from "lucide-react";
import {useNavigate} from "react-router-dom";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell,
} from "recharts";
import TransactionAPI, {Transaction} from "../hooks/TransactionAPI";
import CategoryAPI, {Category} from "../hooks/CategoryAPI";
import {Skeleton} from "../components/ui/skeleton";
import axios from "axios";
import {toast} from "sonner";

export default function Dashboard() {
	const navigate = useNavigate();
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [categories, setCategories] = useState<Category[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const transactionApi = TransactionAPI();
	const categoryApi = CategoryAPI();

	useEffect(() => {
		const fetchData = async () => {
			setIsLoading(true);
			setError(null);

			try {
				const transactionsData = await transactionApi.getTransactions();
				// Change the value in the transactionsData to be a number
				const transactionsDataWithNumbers = transactionsData.map(
					(transaction: Transaction) => ({
						...transaction,
						amount: Number(transaction.amount),
					})
				);
				setTransactions(transactionsDataWithNumbers);

				const categoriesData = await categoryApi.getCategories();
				setCategories(categoriesData);
			} catch (err) {
				if (axios.isAxiosError(err)) {
					setError(
						err.response?.data?.message || "Failed to fetch data"
					);
					toast.error("Could not load dashboard data");
				} else {
					setError("An unexpected error occurred");
					toast.error("An unexpected error occurred");
				}
				console.error("Error fetching data:", err);
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
	}, []);

	// Helper to get category type
	const getCategoryType = (categoryId: number) => {
		const category = categories.find((c) => c.id === categoryId);
		return category?.type || "expense";
	};

	// Process transaction data for charts and summaries
	const processTransactionData = () => {
		// Calculate totals for the period
		const totalIncome = transactions
			.filter((t) => getCategoryType(t.category_id) === "income")
			.reduce((sum, t) => sum + t.amount, 0);

		const totalExpense = transactions
			.filter((t) => getCategoryType(t.category_id) === "expense")
			.reduce((sum, t) => sum + t.amount, 0);

		const balance = totalIncome - totalExpense;

		// Group transactions by month for bar chart
		const monthlyData = transactions.reduce((acc, transaction) => {
			// Extract month from date (YYYY-MM-DD)
			const month = transaction.date.substring(5, 7);
			const monthNames = [
				"Jan",
				"Feb",
				"Mar",
				"Apr",
				"May",
				"Jun",
				"Jul",
				"Aug",
				"Sep",
				"Oct",
				"Nov",
				"Dec",
			];
			const monthName = monthNames[parseInt(month) - 1];

			// Find or create the month entry
			const monthEntry = acc.find(
				(entry) => entry.month === monthName
			) || {
				month: monthName,
				income: 0,
				expense: 0,
			};

			// Update values based on transaction type
			if (getCategoryType(transaction.category_id) === "income") {
				monthEntry.income += transaction.amount;
			} else {
				monthEntry.expense += transaction.amount;
			}

			// If the entry doesn't exist, add it to the array
			if (!acc.find((entry) => entry.month === monthName)) {
				acc.push(monthEntry);
			}

			return acc;
		}, [] as Array<{month: string; income: number; expense: number}>);

		// Sort months chronologically
		const monthOrder = [
			"Jan",
			"Feb",
			"Mar",
			"Apr",
			"May",
			"Jun",
			"Jul",
			"Aug",
			"Sep",
			"Oct",
			"Nov",
			"Dec",
		];
		monthlyData.sort(
			(a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month)
		);

		const expensesByCategory = transactions
			.filter((t) => getCategoryType(t.category_id) === "expense")
			.reduce((acc, transaction) => {
				const category = categories.find(
					(c) => c.id === transaction.category_id
				);
				if (!category) return acc;

				const categoryName = category.name;

				const categoryEntry = acc.find(
					(entry) => entry.name === categoryName
				) || {
					name: categoryName,
					value: 0,
					color: getRandomColor(categoryName),
				};
				console.log("Category entry:", categoryEntry);
				categoryEntry.value += transaction.amount;

				// If the entry doesn't exist, add it to the array
				if (!acc.find((entry) => entry.name === categoryName)) {
					acc.push(categoryEntry);
				}

				return acc;
			}, [] as Array<{name: string; value: number; color: string}>);

		return {
			totalIncome,
			totalExpense,
			balance,
			monthlyData,
			expensesByCategory,
		};
	};

	// Generate a consistent color based on string input
	const getRandomColor = (str: string) => {
		let hash = 0;
		for (let i = 0; i < str.length; i++) {
			hash = str.charCodeAt(i) + ((hash << 5) - hash);
		}
		let color = "#";
		for (let i = 0; i < 3; i++) {
			const value = (hash >> (i * 8)) & 0xff;
			color += ("00" + value.toString(16)).substr(-2);
		}
		return color;
	};

	// Process data
	const {
		totalIncome,
		totalExpense,
		balance,
		monthlyData,
		expensesByCategory,
	} = processTransactionData();

	// Get recent transactions for the list
	const recentTransactions = [...transactions]
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
		.slice(0, 5);

	return (
		<div className="space-y-6">
			{/* Add Transaction Button */}
			<div className="flex justify-end">
				<Button
					onClick={() =>
						navigate("/transactions", {
							state: {openAddDialog: true},
						})
					}
					className="flex items-center gap-1"
				>
					<Plus className="h-4 w-4" />
					Add Transaction
				</Button>
			</div>

			{isLoading ? (
				<>
					{/* Summary Cards Skeleton */}
					<div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
						{Array(3)
							.fill(0)
							.map((_, i) => (
								<Card key={i}>
									<CardHeader className="pb-2">
										<Skeleton className="h-4 w-28 mb-1" />
										<Skeleton className="h-8 w-40" />
									</CardHeader>
									<CardContent>
										<Skeleton className="h-3 w-32" />
									</CardContent>
								</Card>
							))}
					</div>

					{/* Charts Skeleton */}
					<div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
						<Card className="w-full">
							<CardHeader>
								<Skeleton className="h-6 w-40 mb-1" />
								<Skeleton className="h-4 w-56" />
							</CardHeader>
							<CardContent>
								<Skeleton className="h-60 sm:h-80 w-full" />
							</CardContent>
						</Card>

						<Card className="w-full">
							<CardHeader>
								<Skeleton className="h-6 w-40 mb-1" />
								<Skeleton className="h-4 w-56" />
							</CardHeader>
							<CardContent>
								<Skeleton className="h-60 sm:h-80 w-full" />
							</CardContent>
						</Card>
					</div>

					{/* Recent Transactions Skeleton */}
					<Card>
						<CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
							<div>
								<Skeleton className="h-6 w-40 mb-1" />
								<Skeleton className="h-4 w-32" />
							</div>
							<Skeleton className="h-9 w-24" />
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{Array(5)
									.fill(0)
									.map((_, i) => (
										<div
											key={i}
											className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-2 space-y-2 sm:space-y-0 pt-2"
										>
											<div className="flex items-center space-x-4">
												<Skeleton className="h-8 w-8 rounded-full" />
												<div className="space-y-1">
													<Skeleton className="h-4 w-36" />
													<Skeleton className="h-3 w-24" />
												</div>
											</div>
											<Skeleton className="h-4 w-16 pl-12 sm:pl-0" />
										</div>
									))}
							</div>
						</CardContent>
					</Card>
				</>
			) : error ? (
				<div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-lg shadow">
					<p className="text-lg font-medium text-red-500">{error}</p>
					<p className="text-sm text-slate-500 mt-2">
						Please try again later
					</p>
					<Button
						className="mt-4"
						variant="outline"
						onClick={() => window.location.reload()}
					>
						Retry
					</Button>
				</div>
			) : (
				<>
					{/* Summary Cards */}
					<div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
						<Card>
							<CardHeader className="pb-2">
								<CardDescription>Total Income</CardDescription>
								<CardTitle className="text-green-500">
									$
									{totalIncome.toLocaleString(undefined, {
										minimumFractionDigits: 2,
										maximumFractionDigits: 2,
									})}
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-xs text-muted-foreground">
									From{" "}
									{
										transactions.filter(
											(t) =>
												getCategoryType(
													t.category_id
												) === "income"
										).length
									}{" "}
									transactions
								</p>
							</CardContent>
						</Card>
						<Card>
							<CardHeader className="pb-2">
								<CardDescription>
									Total Expenses
								</CardDescription>
								<CardTitle className="text-red-500">
									$
									{totalExpense.toLocaleString(undefined, {
										minimumFractionDigits: 2,
										maximumFractionDigits: 2,
									})}
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-xs text-muted-foreground">
									From{" "}
									{
										transactions.filter(
											(t) =>
												getCategoryType(
													t.category_id
												) === "expense"
										).length
									}{" "}
									transactions
								</p>
							</CardContent>
						</Card>
						<Card className="sm:col-span-2 md:col-span-1">
							<CardHeader className="pb-2">
								<CardDescription>Balance</CardDescription>
								<CardTitle
									className={
										balance >= 0
											? "text-green-500"
											: "text-red-500"
									}
								>
									$
									{balance.toLocaleString(undefined, {
										minimumFractionDigits: 2,
										maximumFractionDigits: 2,
									})}
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-xs text-muted-foreground">
									{balance >= 0
										? "You're doing great!"
										: "Time to budget carefully"}
								</p>
							</CardContent>
						</Card>
					</div>

					{/* Charts */}
					<div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
						<Card className="w-full">
							<CardHeader>
								<CardTitle>Monthly Overview</CardTitle>
								<CardDescription>
									Your income and expenses by month
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="h-60 sm:h-80">
									<ResponsiveContainer
										width="100%"
										height="100%"
									>
										<BarChart data={monthlyData}>
											<CartesianGrid strokeDasharray="3 3" />
											<XAxis dataKey="month" />
											<YAxis />
											<Tooltip />
											<Legend />
											<Bar
												dataKey="income"
												fill="#4ade80"
												name="Income"
											/>
											<Bar
												dataKey="expense"
												fill="#f87171"
												name="Expense"
											/>
										</BarChart>
									</ResponsiveContainer>
								</div>
							</CardContent>
						</Card>

						<Card className="w-full">
							<CardHeader>
								<CardTitle>Expense Categories</CardTitle>
								<CardDescription>
									Breakdown of your expenses by category
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="h-60 sm:h-80">
									<ResponsiveContainer
										width="100%"
										height="100%"
									>
										<PieChart>
											<Pie
												data={expensesByCategory}
												cx="50%"
												cy="50%"
												outerRadius={80}
												fill="#8884d8"
												dataKey="value"
												label={({name, percent}) =>
													`${name} (${(
														percent * 100
													).toFixed(0)}%)`
												}
											>
												{expensesByCategory.map(
													(entry, index) => (
														<Cell
															key={`cell-${index}`}
															fill={entry.color}
														/>
													)
												)}
											</Pie>
											<Tooltip />
											<Legend />
										</PieChart>
									</ResponsiveContainer>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Recent Transactions */}
					<Card>
						<CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
							<div>
								<CardTitle>Recent Transactions</CardTitle>
								<CardDescription>
									Your latest transactions
								</CardDescription>
							</div>
							<Button
								variant="outline"
								onClick={() => navigate("/transactions")}
								className="w-full sm:w-auto"
							>
								View All
							</Button>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{recentTransactions.length > 0 ? (
									recentTransactions.map((transaction) => {
										const category = categories.find(
											(c) =>
												c.id === transaction.category_id
										);
										const isExpense =
											category?.type === "expense";

										return (
											<div
												key={transaction.id}
												className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-2 last:border-0 space-y-2 sm:space-y-0 pt-2"
											>
												<div className="flex items-center space-x-4">
													<div
														className={`h-8 w-8 rounded-full flex items-center justify-center ${
															isExpense
																? "bg-red-100"
																: "bg-green-100"
														}`}
													>
														<span
															className={
																isExpense
																	? "text-red-500"
																	: "text-green-500"
															}
														>
															{isExpense
																? "-"
																: "+"}
														</span>
													</div>
													<div>
														<p className="font-medium">
															{
																transaction.description
															}
														</p>
														<p className="text-sm text-slate-500">
															{category?.name ||
																"Unknown"}{" "}
															• {transaction.date}
														</p>
													</div>
												</div>
												<p
													className={`font-medium ${
														isExpense
															? "text-red-500"
															: "text-green-500"
													} pl-12 sm:pl-0`}
												>
													{isExpense ? "-" : "+"}$
													{transaction.amount}
												</p>
											</div>
										);
									})
								) : (
									<div className="text-center py-4">
										<p>No transactions found</p>
										<Button
											className="mt-2"
											variant="outline"
											onClick={() =>
												navigate("/transactions", {
													state: {
														openAddDialog: true,
													},
												})
											}
										>
											Add your first transaction
										</Button>
									</div>
								)}
							</div>
						</CardContent>
					</Card>
				</>
			)}
		</div>
	);
}
