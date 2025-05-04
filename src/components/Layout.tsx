import {Outlet, Link, useLocation, useNavigate} from "react-router-dom";
import {Home, CreditCard, PieChart, LogOut, Menu, X} from "lucide-react";
import {cn} from "../lib/utils";
import {useAuth} from "../hooks/AuthContext";
import {Skeleton} from "../components/ui/skeleton";
import {toast} from "sonner";
import {useState, useEffect} from "react";

export default function Layout() {
	const location = useLocation();
	const navigate = useNavigate();
	const {user, logout, isLoading} = useAuth();
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const checkIsMobile = () => {
			setIsMobile(window.innerWidth < 768);
		};
		checkIsMobile();

		window.addEventListener("resize", checkIsMobile);

		return () => window.removeEventListener("resize", checkIsMobile);
	}, []);

	useEffect(() => {
		if (isMobile) {
			setIsSidebarOpen(false);
		}
	}, [location.pathname, isMobile]);

	const isActive = (path: string) => {
		return location.pathname === path;
	};

	const handleLogout = () => {
		logout();
		toast.success("Logged out successfully");
		navigate("/login");
	};

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen);
	};

	return (
		<div className="flex min-h-screen bg-slate-50 w-full dark:bg-slate-950">
			{/* Mobile sidebar overlay */}
			{isMobile && isSidebarOpen && (
				<div
					className="fixed inset-0 bg-opacity-50 z-20"
					onClick={() => setIsSidebarOpen(false)}
				/>
			)}

			{/* Sidebar */}
			<aside
				className={cn(
					"bg-white dark:bg-slate-900 dark:border-slate-800 border-r z-30",
					"fixed h-full transition-all duration-300 ease-in-out",
					isMobile
						? isSidebarOpen
							? "left-0 w-64"
							: "-left-64 w-64"
						: "left-0 w-64",
					"md:relative md:left-0"
				)}
			>
				<div className="flex h-16 items-center justify-between border-b px-6 dark:border-slate-800">
					<h1 className="text-xl font-bold">Expense Tracker</h1>
					{isMobile && (
						<button onClick={toggleSidebar} className="md:hidden">
							<X className="h-5 w-5" />
						</button>
					)}
				</div>

				{/* User info */}
				{isLoading ? (
					<div className="flex items-center gap-2 p-4 border-b dark:border-slate-800">
						<Skeleton className="h-8 w-8 rounded-full" />
						<div className="flex flex-col gap-1">
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-3 w-32" />
						</div>
					</div>
				) : user ? (
					<div className="flex items-center gap-2 p-4 border-b dark:border-slate-800">
						<div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
							{user?.username?.charAt(0).toUpperCase()}
						</div>
						<div className="flex flex-col">
							<span className="font-medium">{user.username}</span>
							<span className="text-xs text-slate-500">
								{user.email}
							</span>
						</div>
					</div>
				) : null}

				<nav className="space-y-1 p-4">
					<Link
						to="/"
						className={cn(
							"flex items-center gap-3 rounded-md px-3 py-2 text-slate-900 hover:bg-slate-100 dark:text-slate-50 dark:hover:bg-slate-800",
							isActive("/") && "bg-slate-100 dark:bg-slate-800"
						)}
					>
						<Home className="h-5 w-5" />
						Dashboard
					</Link>
					<Link
						to="/transactions"
						className={cn(
							"flex items-center gap-3 rounded-md px-3 py-2 text-slate-900 hover:bg-slate-100 dark:text-slate-50 dark:hover:bg-slate-800",
							isActive("/transactions") &&
								"bg-slate-100 dark:bg-slate-800"
						)}
					>
						<CreditCard className="h-5 w-5" />
						Transactions
					</Link>
					<Link
						to="/categories"
						className={cn(
							"flex items-center gap-3 rounded-md px-3 py-2 text-slate-900 hover:bg-slate-100 dark:text-slate-50 dark:hover:bg-slate-800",
							isActive("/categories") &&
								"bg-slate-100 dark:bg-slate-800"
						)}
					>
						<PieChart className="h-5 w-5" />
						Categories
					</Link>
					<div className="mt-auto pt-8">
						<button
							onClick={handleLogout}
							className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-slate-900 hover:bg-slate-100 dark:text-slate-50 dark:hover:bg-slate-800"
						>
							<LogOut className="h-5 w-5" />
							Logout
						</button>
					</div>
				</nav>
			</aside>

			{/* Main content */}
			<main
				className={cn("flex-1 transition-all duration-300 ease-in-out")}
			>
				<div className="flex h-16 items-center border-b bg-white px-4 dark:bg-slate-900 dark:border-slate-800 md:hidden">
					<button onClick={toggleSidebar} className="mr-4">
						<Menu className="h-6 w-6" />
					</button>
					<h2 className="text-lg font-medium">
						{location.pathname === "/" && "Dashboard"}
						{location.pathname === "/transactions" &&
							"Transactions"}
						{location.pathname === "/categories" && "Categories"}
					</h2>
				</div>
				<div className="p-4 md:p-6 lg:p-8">
					<Outlet />
				</div>
			</main>
		</div>
	);
}
