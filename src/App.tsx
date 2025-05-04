import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from "react-router-dom";
import {Toaster} from "./components/ui/sonner";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Categories from "./pages/Categories";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Layout from "./components/Layout";
import {AuthProvider, useAuth} from "./hooks/AuthContext";
import {Skeleton} from "./components/ui/skeleton";
import {ReactNode} from "react";
import "./App.css";

// Protected route component
function ProtectedRoute({children}: {children: ReactNode}) {
	const {isAuthenticated, isLoading} = useAuth();

	if (isLoading) {
		return (
			<div className="flex flex-col h-screen w-full bg-slate-50 dark:bg-slate-950">
				<div className="flex h-16 items-center border-b bg-white dark:bg-slate-900 dark:border-slate-800">
					<Skeleton className="h-8 w-40 mx-6" />
				</div>
				<div className="flex flex-1">
					<div className="w-64 border-r bg-white dark:bg-slate-900 dark:border-slate-800 hidden md:block">
						<div className="flex h-16 items-center justify-between border-b px-6 dark:border-slate-800">
							<Skeleton className="h-8 w-36" />
						</div>
						<div className="flex items-center gap-2 p-4 border-b dark:border-slate-800">
							<Skeleton className="h-8 w-8 rounded-full" />
							<div className="flex flex-col gap-1">
								<Skeleton className="h-4 w-24" />
								<Skeleton className="h-3 w-32" />
							</div>
						</div>
						<div className="p-4 space-y-2">
							{Array(3)
								.fill(0)
								.map((_, i) => (
									<Skeleton
										key={i}
										className="h-10 w-full rounded-md"
									/>
								))}
						</div>
					</div>
					<div className="flex-1 p-6">
						<div className="space-y-4">
							<Skeleton className="h-8 w-64" />
							<div className="grid gap-4 grid-cols-1 md:grid-cols-3">
								{Array(3)
									.fill(0)
									.map((_, i) => (
										<Skeleton
											key={i}
											className="h-28 w-full rounded-md"
										/>
									))}
							</div>
							<Skeleton className="h-64 w-full rounded-md" />
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (!isAuthenticated) {
		return <Navigate to="/login" />;
	}

	return <>{children}</>;
}

function AppRoutes() {
	const {isAuthenticated} = useAuth();

	return (
		<Routes>
			<Route
				path="/login"
				element={isAuthenticated ? <Navigate to="/" /> : <Login />}
			/>
			<Route
				path="/register"
				element={isAuthenticated ? <Navigate to="/" /> : <Register />}
			/>
			<Route
				path="/"
				element={
					<ProtectedRoute>
						<Layout />
					</ProtectedRoute>
				}
			>
				<Route index element={<Dashboard />} />
				<Route path="/transactions" element={<Transactions />} />
				<Route path="/categories" element={<Categories />} />
			</Route>
		</Routes>
	);
}

function App() {
	return (
		<Router>
			<AuthProvider>
				<Toaster />
				<AppRoutes />
			</AuthProvider>
		</Router>
	);
}

export default App;
