import {useEffect, useState} from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "../components/ui/card";
import {Button} from "../components/ui/button";
import {Input} from "../components/ui/input";
import {Label} from "../components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../components/ui/select";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../components/ui/dialog";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "../components/ui/tabs";
import {Plus, Edit, Trash2} from "lucide-react";
import {toast} from "sonner";
import {Skeleton} from "../components/ui/skeleton";
import CategoryAPI from "@/hooks/CategoryAPI";

// Define the Category type
interface Category {
	id: number;
	name: string;
	type: "income" | "expense";
}

export default function Categories() {
	const [categories, setCategories] = useState<Category[]>([]);
	const [activeTab, setActiveTab] = useState<"expense" | "income">("expense");
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [formData, setFormData] = useState({
		name: "",
		type: activeTab,
	});
	const [editingId, setEditingId] = useState<number | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const categoryApi = CategoryAPI();

	// Filter categories by type
	const filteredCategories = categories.filter(
		(category) => category.type === activeTab
	);

	useEffect(() => {
		const fetchCategories = async () => {
			setIsLoading(true);
			try {
				const response = await categoryApi.getCategories();
				setCategories(response);
			} catch (error) {
				toast.error("Failed to fetch categories");
				console.error(error);
			} finally {
				setIsLoading(false);
			}
		};
		fetchCategories();
	}, []);

	// Form handlers
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const {name, value} = e.target;
		setFormData({
			...formData,
			[name]: value,
		});
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.name) {
			toast.error("Please enter a category name");
			return;
		}

		// Check for duplicate name in the same type
		const isDuplicate = categories.some(
			(category) =>
				category.name.toLowerCase() === formData.name.toLowerCase() &&
				category.type === formData.type &&
				category.id !== editingId
		);

		if (isDuplicate) {
			toast.error(
				`A ${formData.type} category with this name already exists`
			);
			return;
		}

		if (editingId) {
			// Update existing category
			const updatedCategories = categories.map((category) =>
				category.id === editingId
					? {
							...category,
							name: formData.name,
							type: formData.type as "income" | "expense",
					  }
					: category
			);

			const response = await categoryApi.updateCategory(
				editingId,
				formData
			);
			console.log("Response:", response);
			if (response) {
				setCategories(updatedCategories);
				toast.success("Category updated successfully");
			} else {
				toast.error("Failed to update category");
			}
		} else {
			const data = {
				name: formData.name,
				type: formData.type,
			};
			const response = await categoryApi.createCategory(data);

			if (response.success) {
				setCategories([...categories, response.payload]);
				toast.success("Category added successfully");
			} else {
				toast.error(response.message);
			}
		}

		// Reset form and close dialog
		setFormData({
			name: "",
			type: activeTab,
		});
		setEditingId(null);
		setIsDialogOpen(false);
	};

	const handleEdit = (category: Category) => {
		setEditingId(category.id);
		setFormData({
			name: category.name,
			type: category.type,
		});
		setIsDialogOpen(true);
	};

	const handleDelete = async (id: number) => {
		const updatedCategories = categories.filter(
			(category) => category.id !== id
		);
		const response = await categoryApi.deleteCategory(id);
		if (response.success) {
			setCategories(updatedCategories);
			toast.success("Category deleted successfully");
		} else {
			toast.error("Failed to delete category");
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
				<h2 className="text-2xl font-bold">Categories</h2>
				<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
					<DialogTrigger asChild>
						<Button
							className="flex shrink-0 items-center gap-1"
							onClick={() => {
								setEditingId(null);
								setFormData({
									name: "",
									type: activeTab,
								});
							}}
						>
							<Plus className="h-4 w-4" />
							Add Category
						</Button>
					</DialogTrigger>
					<DialogContent className="sm:max-w-[425px]">
						<DialogHeader>
							<DialogTitle>
								{editingId ? "Edit Category" : "Add Category"}
							</DialogTitle>
							<DialogDescription>
								{editingId
									? "Update category details"
									: "Enter details for a new category"}
							</DialogDescription>
						</DialogHeader>
						<form onSubmit={handleSubmit}>
							<div className="grid gap-4 py-4">
								<div className="grid gap-2">
									<Label htmlFor="type">Type</Label>
									<Select
										value={formData.type}
										onValueChange={(value: string) =>
											setFormData({
												...formData,
												type: value as
													| "income"
													| "expense",
											})
										}
									>
										<SelectTrigger id="type">
											<SelectValue placeholder="Select type" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="expense">
												Expense
											</SelectItem>
											<SelectItem value="income">
												Income
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="grid gap-2">
									<Label htmlFor="name">Name</Label>
									<Input
										id="name"
										name="name"
										value={formData.name}
										onChange={handleInputChange}
										placeholder="Enter category name"
									/>
								</div>
							</div>
							<DialogFooter>
								<Button type="submit">
									{editingId ? "Update" : "Add"} Category
								</Button>
							</DialogFooter>
						</form>
					</DialogContent>
				</Dialog>
			</div>

			<Tabs
				value={activeTab}
				onValueChange={(value: string) =>
					setActiveTab(value as "expense" | "income")
				}
				className="w-full"
			>
				<TabsList className="grid w-full grid-cols-2">
					<TabsTrigger value="expense">Expenses</TabsTrigger>
					<TabsTrigger value="income">Income</TabsTrigger>
				</TabsList>

				<TabsContent value="expense" className="mt-4">
					<Card>
						<CardHeader>
							<CardTitle>Expense Categories</CardTitle>
							<CardDescription>
								Categories for tracking your expenses
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
												className="flex items-center justify-between py-2 border-b last:border-0"
											>
												<Skeleton className="h-6 w-40" />
												<div className="flex space-x-2">
													<Skeleton className="h-8 w-8 rounded-md" />
													<Skeleton className="h-8 w-8 rounded-md" />
												</div>
											</div>
										))}
								</div>
							) : filteredCategories.length > 0 ? (
								<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
									{filteredCategories.map((category) => (
										<Card
											key={category.id}
											className="flex flex-col justify-between border shadow-sm"
										>
											<CardHeader className="pb-2">
												<CardTitle className="text-lg">
													{category.name}
												</CardTitle>
											</CardHeader>
											<CardFooter className="justify-end pt-2">
												<div className="flex space-x-2">
													<Button
														variant="ghost"
														size="icon"
														onClick={() =>
															handleEdit(category)
														}
													>
														<Edit className="h-4 w-4" />
													</Button>
													<Button
														variant="ghost"
														size="icon"
														onClick={() =>
															handleDelete(
																category.id
															)
														}
													>
														<Trash2 className="h-4 w-4" />
													</Button>
												</div>
											</CardFooter>
										</Card>
									))}
								</div>
							) : (
								<div className="text-center py-6">
									<p className="text-slate-500">
										No expense categories found. Add your
										first category.
									</p>
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="income" className="mt-4">
					<Card>
						<CardHeader>
							<CardTitle>Income Categories</CardTitle>
							<CardDescription>
								Categories for tracking your income
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
												className="flex items-center justify-between py-2 border-b last:border-0"
											>
												<Skeleton className="h-6 w-40" />
												<div className="flex space-x-2">
													<Skeleton className="h-8 w-8 rounded-md" />
													<Skeleton className="h-8 w-8 rounded-md" />
												</div>
											</div>
										))}
								</div>
							) : filteredCategories.length > 0 ? (
								<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
									{filteredCategories.map((category) => (
										<Card
											key={category.id}
											className="flex flex-col justify-between border shadow-sm"
										>
											<CardHeader className="pb-2">
												<CardTitle className="text-lg">
													{category.name}
												</CardTitle>
											</CardHeader>
											<CardFooter className="justify-end pt-2">
												<div className="flex space-x-2">
													<Button
														variant="ghost"
														size="icon"
														onClick={() =>
															handleEdit(category)
														}
													>
														<Edit className="h-4 w-4" />
													</Button>
													<Button
														variant="ghost"
														size="icon"
														onClick={() =>
															handleDelete(
																category.id
															)
														}
													>
														<Trash2 className="h-4 w-4" />
													</Button>
												</div>
											</CardFooter>
										</Card>
									))}
								</div>
							) : (
								<div className="text-center py-6">
									<p className="text-slate-500">
										No income categories found. Add your
										first category.
									</p>
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
