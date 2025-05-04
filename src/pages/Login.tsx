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

export default function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const {login, isLoading} = useAuth();
	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			await login(email, password);
			toast.success("Logged in successfully!");
			navigate("/");
		} catch (error) {
			if (axios.isAxiosError(error)) {
				toast.error(
					error.response?.data?.message ||
						"Login failed. Please check your credentials."
				);
			} else {
				toast.error("Login failed. Please try again.");
			}
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle className="text-2xl">Login</CardTitle>
					<CardDescription>
						Enter your credentials to access your account
					</CardDescription>
				</CardHeader>
				<form onSubmit={handleSubmit}>
					<CardContent className="space-y-4">
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
							<div className="flex items-center justify-between">
								<Label htmlFor="password">Password</Label>
							</div>
							<Input
								id="password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
							/>
						</div>
					</CardContent>
					<CardFooter className="flex flex-col pt-4 space-y-4">
						<Button
							type="submit"
							className="w-full"
							disabled={isLoading}
						>
							{isLoading ? "Logging in..." : "Login"}
						</Button>
						<p className="text-center text-sm">
							Don't have an account?{" "}
							<Link
								to="/register"
								className="text-blue-600 hover:underline dark:text-blue-400"
							>
								Sign up
							</Link>
						</p>
					</CardFooter>
				</form>
			</Card>
		</div>
	);
}
