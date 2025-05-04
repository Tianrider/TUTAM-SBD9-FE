import {useState, useEffect} from "react";
import {format} from "date-fns";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "../components/ui/dialog";
import {Button} from "../components/ui/button";
import {Input} from "../components/ui/input";
import {Label} from "../components/ui/label";
import {toast} from "sonner";
import {Transaction, TransactionCreateRequest} from "../hooks/TransactionAPI";
import {Category} from "../hooks/CategoryAPI";

interface AddTransactionDialogProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	onAddTransaction?: (transaction: TransactionCreateRequest) => void;
	editTransaction?: Transaction | null;
	categories?: Category[];
}

export default function AddTransactionDialog({
	isOpen,
	onOpenChange,
	onAddTransaction,
	editTransaction,
	categories = [],
}: AddTransactionDialogProps) {
	// Find the category for the transaction being edited
	const editCategory =
		editTransaction && categories.length > 0
			? categories.find((c) => c.id === editTransaction.category_id)
			: null;

	const [formData, setFormData] = useState({
		description: editTransaction?.description || "",
		amount: editTransaction?.amount
			? editTransaction.amount.toString()
			: "",
		type: editCategory?.type || "expense",
		category_id: editTransaction?.category_id
			? editTransaction.category_id.toString()
			: "",
		date: editTransaction?.date
			? new Date(editTransaction.date)
			: new Date(),
	});

	// Update form data when editTransaction changes
	useEffect(() => {
		if (editTransaction) {
			const foundCategory = categories.find(
				(c) => c.id === editTransaction.category_id
			);
			setFormData({
				description: editTransaction.description || "",
				amount: editTransaction.amount
					? editTransaction.amount.toString()
					: "",
				type: foundCategory?.type || "expense",
				category_id: editTransaction.category_id
					? editTransaction.category_id.toString()
					: "",
				date: editTransaction.date
					? new Date(editTransaction.date)
					: new Date(),
			});
		} else {
			// Reset form when adding a new transaction
			setFormData({
				description: "",
				amount: "",
				type: "expense",
				category_id: "",
				date: new Date(),
			});
		}
	}, [editTransaction, categories]);

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		const {name, value} = e.target;

		// Handle type change by resetting category
		if (name === "type") {
			setFormData({
				...formData,
				[name]: value as "income" | "expense",
				category_id: "", // Reset category when type changes
			});
		} else {
			setFormData({
				...formData,
				[name]: value,
			});
		}
	};

	const handleDateChange = (date: Date | undefined) => {
		if (date) {
			setFormData({
				...formData,
				date,
			});
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (
			!formData.description ||
			!formData.amount ||
			!formData.category_id ||
			!formData.date
		) {
			toast.error("Please fill in all fields");
			return;
		}

		const amount = parseFloat(formData.amount);
		if (isNaN(amount) || amount <= 0) {
			toast.error("Please enter a valid amount");
			return;
		}

		const categoryId = parseInt(formData.category_id, 10);
		if (isNaN(categoryId)) {
			toast.error("Please select a valid category");
			return;
		}

		const transactionData: TransactionCreateRequest = {
			description: formData.description,
			amount,
			category_id: categoryId,
			date: format(formData.date, "yyyy-MM-dd"),
		};

		if (onAddTransaction) {
			onAddTransaction(transactionData);
		}

		// Reset form and close dialog
		setFormData({
			description: "",
			amount: "",
			type: "expense",
			category_id: "",
			date: new Date(),
		});
		onOpenChange(false);

		toast.success(
			editTransaction
				? "Transaction updated successfully"
				: "Transaction added successfully"
		);
	};

	// Filter categories by the selected type
	const filteredCategories = categories.filter(
		(category) => category.type === formData.type
	);

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>
						{editTransaction
							? "Edit Transaction"
							: "Add Transaction"}
					</DialogTitle>
					<DialogDescription>
						{editTransaction
							? "Update transaction details"
							: "Enter details for a new transaction"}
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit}>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="type">Type</Label>
							<select
								id="type"
								name="type"
								className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm"
								value={formData.type}
								onChange={handleInputChange}
							>
								<option value="expense">Expense</option>
								<option value="income">Income</option>
							</select>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="description">Description</Label>
							<Input
								id="description"
								name="description"
								value={formData.description}
								onChange={handleInputChange}
								placeholder="Enter description"
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="amount">Amount</Label>
							<Input
								id="amount"
								name="amount"
								type="number"
								step="0.01"
								min="0.01"
								value={formData.amount}
								onChange={handleInputChange}
								placeholder="Enter amount"
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="category_id">Category</Label>
							<select
								id="category_id"
								name="category_id"
								className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm"
								value={formData.category_id}
								onChange={handleInputChange}
							>
								<option value="">Select category</option>
								{filteredCategories.map((category) => (
									<option
										key={category.id}
										value={category.id.toString()}
									>
										{category.name}
									</option>
								))}
							</select>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="date">Date</Label>
							<div className="text-center p-4 border rounded-md">
								<p className="mb-2">
									Selected Date:{" "}
									{formData.date
										? format(formData.date, "PPP")
										: "None"}
								</p>
								<div className="flex justify-center">
									<input
										type="date"
										className="p-2 border rounded"
										value={format(
											formData.date,
											"yyyy-MM-dd"
										)}
										onChange={(e) =>
											handleDateChange(
												new Date(e.target.value)
											)
										}
									/>
								</div>
							</div>
						</div>
					</div>
					<DialogFooter>
						<Button type="submit">
							{editTransaction ? "Update" : "Add"} Transaction
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
