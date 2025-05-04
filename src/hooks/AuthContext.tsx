import {createContext, useContext, useState, useEffect, ReactNode} from "react";
import AuthAPI from "./AuthAPI";

interface User {
	id: string;
	username: string;
	email: string;
}

interface AuthContextType {
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	logout: () => void;
	login: (email: string, password: string) => Promise<void>;
	register: (
		username: string,
		email: string,
		password: string
	) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({children}: {children: ReactNode}) {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const authApi = AuthAPI();

	useEffect(() => {
		const loadUser = async () => {
			setIsLoading(true);
			try {
				// Check if we have a token stored
				const hasToken = authApi.initializeAuth();
				console.log(hasToken);
				if (hasToken) {
					const userData = await authApi.getCurrentUser();
					setUser(userData.user);
				}
			} catch (error) {
				// Token is invalid or expired
				console.error("Auth error:", error);
				setUser(null);
			} finally {
				setIsLoading(false);
			}
		};

		loadUser();
	}, []);

	const login = async (email: string, password: string) => {
		setIsLoading(true);
		const response = await authApi.login({email, password});
		setUser(response.user);
		setIsLoading(false);
	};

	const logout = () => {
		authApi.logout();
		setUser(null);
	};

	const register = async (
		username: string,
		email: string,
		password: string
	) => {
		setIsLoading(true);
		const response = await authApi.register({username, email, password});
		setUser(response.user);
		setIsLoading(false);
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				isAuthenticated: !!user,
				isLoading,
				logout,
				login,
				register,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
