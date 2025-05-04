import {useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "../components/ui/card";
import {Input} from "../components/ui/input";
import {Label} from "../components/ui/label";
import {Button} from "../components/ui/button";
import {toast} from "sonner";
import {useAuth} from "../hooks/AuthContext";
import axios from "axios";

export default function Register() {
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const {register, isLoading} = useAuth();
	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (password !== confirmPassword) {
			toast.error("Passwords do not match");
			return;
		}

		try {
			await register(username, email, password);
			toast.success("Account created successfully!");
			navigate("/");
		} catch (error) {
			if (axios.isAxiosError(error)) {
				toast.error(
					error.response?.data?.message ||
						"Registration failed. Please try again."
				);
			} else {
				toast.error("Registration failed. Please try again.");
			}
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle className="text-2xl">
						Create an account
					</CardTitle>
					<CardDescription>
						Enter your details to create your account
					</CardDescription>
				</CardHeader>
				<form onSubmit={handleSubmit}>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="username">Username</Label>
							<Input
								id="username"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								placeholder="name@example.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<Input
								id="password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="confirmPassword">
								Confirm Password
							</Label>
							<Input
								id="confirmPassword"
								type="password"
								value={confirmPassword}
								onChange={(e) =>
									setConfirmPassword(e.target.value)
								}
								required
							/>
						</div>
					</CardContent>
					<CardFooter className="flex flex-col mt-4 space-y-4">
						<Button
							type="submit"
							className="w-full"
							disabled={isLoading}
						>
							{isLoading ? "Creating Account..." : "Register"}
						</Button>
						<p className="text-center text-sm">
							Already have an account?{" "}
							<Link
								to="/login"
								className="text-blue-600 hover:underline dark:text-blue-400"
							>
								Sign in
							</Link>
						</p>
					</CardFooter>
				</form>
			</Card>
		</div>
	);
}
