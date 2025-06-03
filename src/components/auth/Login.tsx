import React, { useState, useEffect } from "react";
import { Form, Input, Button, Typography, Space, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./auth.css";

const { Title } = Typography;

interface LoginFormValues {
	username: string;
	password: string;
}
interface ApiResponse {
	status: number;
}
const Login: React.FC = () => {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);

	// 检查用户是否已登录
	useEffect(() => {
		const userInfo = sessionStorage.getItem("userInfo");
		if (userInfo) {
			navigate("/chat");
		}
	}, [navigate]);

	const onFinish = async (values: LoginFormValues) => {
		setLoading(true);
		try {
			// 创建表单数据
			const formData = new FormData();
			formData.append("username", values.username);
			formData.append("password", values.password);
			formData.append("inviteCode", "oqwdnioqn$$5091823");
			// 创建 AbortController 用于超时控制
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时

			// 定义响应类型接口
			interface CustomResponse {
				ok: boolean;
				status: number;
				text: string;
			}

			// 尝试使用不同的方式发送请求
			let response: CustomResponse;
			try {
				// 尝试使用 XMLHttpRequest 发送请求
				response = await new Promise<CustomResponse>(
					(resolve, reject) => {
						const xhr = new XMLHttpRequest();
						xhr.open(
							"POST",
							"http://47.94.59.81:8089/basic/auth",
							true,
						);
						xhr.timeout = 10000; // 10秒超时

						xhr.onload = function () {
							if (this.status >= 200 && this.status < 300) {
								resolve({
									ok: true,
									status: this.status,
									text: this.responseText,
								});
							} else {
								resolve({
									ok: false,
									status: this.status,
									text: this.responseText,
								});
							}
						};

						xhr.onerror = function () {
							reject(new Error("Network Error"));
						};

						xhr.ontimeout = function () {
							reject(new Error("Request Timeout"));
						};

						// 不设置 Content-Type，让浏览器自动设置
						xhr.send(formData);
					},
				);
			} catch (fetchError) {
				console.error("XMLHttpRequest 请求失败:", fetchError);

				return;
			}

			clearTimeout(timeoutId); // 清除超时计时器

			// 检查响应状态
			if (response.ok && response.text !== "") {
				console.log("🚀 ~ onFinish ~ response:", response);
				// 尝试解析 JSON 响应，但首先检查是否有内容
				const text = response.text;
				let testResJson: ApiResponse = { status: -1 };
				if (text) {
					try {
						// 尝试解析 JSON，但不需要存储结果
						testResJson = JSON.parse(text);
					} catch (error) {
						console.error("解析响应失败:", error);
					}
				}
				if (testResJson?.status !== 0) {
					message.error(
						"请检查用户名和密码或者当前服务已停止体验",
					);
					return;
				}
				// 登录成功，保存用户信息
				sessionStorage.setItem(
					"userInfo",
					JSON.stringify({ username: values.username }),
				);
				message.success("登录成功");
				navigate("/chat");
			} else {
				// 处理错误响应
				try {
					message.error(
						"请检查用户名和密码或者当前服务已停止体验",
					);
				} catch {
					message.error(
						"请检查用户名和密码或者当前服务已停止体验",
					);
				}
			}
		} catch (error) {
			console.error("登录请求出错:", error);
			if (error instanceof DOMException && error.name === "AbortError") {
				message.error(
					"登录请求超时，请检查网络连接或者当前服务已停止体验",
				);
			} else {
				message.error("登录失败，网络错误或者当前服务已停止体验");
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="auth-container">
			<div className="auth-form">
				<div className="logo-container">
					<img src="/vite.svg" alt="Logo" className="logo" />
				</div>

				<Title level={2} className="auth-title">
					登录
				</Title>

				<Form
					name="login"
					initialValues={{ remember: true }}
					onFinish={onFinish}
					size="large"
					layout="vertical"
				>
					<Form.Item
						name="username"
						rules={[{ required: true, message: "请输入用户名" }]}
					>
						<Input prefix={<UserOutlined />} placeholder="用户名" />
					</Form.Item>

					<Form.Item
						name="password"
						rules={[{ required: true, message: "请输入密码" }]}
					>
						<Input.Password
							prefix={<LockOutlined />}
							placeholder="密码"
						/>
					</Form.Item>

					<Form.Item>
						<Button
							type="primary"
							htmlType="submit"
							loading={loading}
							block
						>
							登录
						</Button>
					</Form.Item>

					<div className="auth-footer">
						<Space>
							还没有账号？
							<a onClick={() => navigate("/register")}>
								立即注册
							</a>
						</Space>
					</div>
				</Form>
			</div>
		</div>
	);
};

export default Login;
