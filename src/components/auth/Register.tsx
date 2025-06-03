import React, { useState } from "react";
import { Form, Input, Button, Typography, Space, notification } from "antd";
import { UserOutlined, LockOutlined, KeyOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./auth.css";

const { Title } = Typography;

interface RegisterFormValues {
	username: string;
	password: string;
	inviteCode: string;
}
interface ApiResponse {
	message: string;
}
const Register: React.FC = () => {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);

	const onFinish = async (values: RegisterFormValues) => {
		setLoading(true);
		try {
			// 创建表单数据
			const formData = new FormData();
			formData.append("username", values.username);
			formData.append("password", values.password);
			formData.append("inviteCode", values.inviteCode);

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
							"http://47.94.59.81:8089/basic/register",
							true,
						);
						xhr.timeout = 10000; // 10秒超时

						xhr.onload = function () {
							console.log(
								"🚀 ~ onFinish ~ this.status:",
								this.status,
							);
							console.log("🚀 ~ onFinish ~ this:", this);
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
				notification.error({
					message: "注册失败",
					description: "请检查信息是否正确",
				});
				return;
			}

			clearTimeout(timeoutId); // 清除超时计时器

			// 检查响应状态
			if (response.ok && response.text !== "") {
				// 尝试解析 JSON 响应，但首先检查是否有内容
				const text = response.text;
				let testResJson: ApiResponse = { message: "" };
				if (text) {
					try {
						// 尝试解析 JSON，但不需要存储结果
						testResJson = JSON.parse(text);
					} catch (error) {
						console.error("解析响应失败:", error);
					}
				}
				if (testResJson.message === "repeated username!") {
					notification.error({
						message: "注册失败",
						description: "用户名已存在，请更换用户名",
					});
					return;
				}
				notification.success({
					message: "注册成功",
					description: "快来试试吧",
				});
				navigate("/login");
			} else {
				// 处理错误响应
				try {
					const errorMessage = "请检查信息是否正确";
					console.log("🚀 ~ onFinish ~ errorMessage:", errorMessage);

					notification.error({
						message: "注册失败",
						description: errorMessage,
					});
				} catch {
					notification.error({
						message: "注册失败",
						description: "请检查信息是否正确",
					});
				}
			}
		} catch (error) {
			console.error("注册请求出错:", error);
			notification.error({
				message: "注册失败",
				description: "请检查信息是否正确",
			});
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
					注册
				</Title>

				<Form
					name="register"
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

					<Form.Item
						name="inviteCode"
						rules={[{ required: true, message: "请输入邀请码" }]}
					>
						<Input prefix={<KeyOutlined />} placeholder="邀请码" />
					</Form.Item>

					<Form.Item>
						<Button
							type="primary"
							htmlType="submit"
							loading={loading}
							block
						>
							注册
						</Button>
					</Form.Item>

					<div className="auth-footer">
						<Space>
							已有账号？
							<a onClick={() => navigate("/login")}>返回登录</a>
						</Space>
					</div>
				</Form>
			</div>
		</div>
	);
};

export default Register;
