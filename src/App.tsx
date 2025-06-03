import React from "react";
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from "react-router-dom";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Chat from "./components/chat/Chat";

const App: React.FC = () => {
	// 检查用户是否已登录的函数
	const isAuthenticated = () => {
		return sessionStorage.getItem("userInfo") !== null;
	};

	// 受保护的路由组件
	const ProtectedRoute: React.FC<{ element: React.ReactNode }> = ({
		element,
	}) => {
		return isAuthenticated() ? <>{element}</> : <Navigate to="/login" />;
	};

	// 如果用户已登录，从登录/注册页面重定向到聊天页面
	const RedirectIfAuthenticated: React.FC<{ element: React.ReactNode }> = ({
		element,
	}) => {
		return !isAuthenticated() ? <>{element}</> : <Navigate to="/chat" />;
	};

	return (
		<Router>
			<Routes>
				<Route
					path="/login"
					element={<RedirectIfAuthenticated element={<Login />} />}
				/>
				<Route
					path="/register"
					element={<RedirectIfAuthenticated element={<Register />} />}
				/>
				<Route
					path="/chat"
					element={<ProtectedRoute element={<Chat />} />}
				/>
				<Route
					path="/"
					element={
						<Navigate to={isAuthenticated() ? "/chat" : "/login"} />
					}
				/>
			</Routes>
		</Router>
	);
};

export default App;
