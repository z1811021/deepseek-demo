import { useXAgent, useXChat, Sender, Bubble } from "@ant-design/x";
import { UserOutlined } from "@ant-design/icons";
import type { BubbleProps } from "@ant-design/x";
import OpenAI from "openai";
import { Flex, type GetProp, Typography, Space, Spin, Switch } from "antd";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import markdownit from "markdown-it";
import "./chat.css";
const md = markdownit({ html: true, breaks: true });
const roles: GetProp<typeof Bubble.List, "roles"> = {
	ai: {
		placement: "start",
		avatar: { icon: <UserOutlined />, style: { background: "#fde3cf" } },
	},
	local: {
		placement: "end",
		avatar: { icon: <UserOutlined />, style: { background: "#87d068" } },
	},
};

const renderMarkdown: BubbleProps["messageRender"] = (content) => {
	return content === "" ? (
		<Space>
			<Spin size="small" />
			Loading...
		</Space>
	) : (
		<Typography>
			{/* biome-ignore lint/security/noDangerouslySetInnerHtml: used in demo */}
			<div dangerouslySetInnerHTML={{ __html: md.render(content) }} />
		</Typography>
	);
};

const Chat: React.FC = () => {
	const [content, setContent] = useState("");
	const [currentModel, setCurrentModel] = useState<"deepseek" | "qwen">(
		"deepseek",
	);
	const navigate = useNavigate();

	// 检查用户是否已登录
	useEffect(() => {
		const userInfo = sessionStorage.getItem("userInfo");
		if (!userInfo) {
			navigate("/login");
		}
	}, [navigate]);

	const client = useMemo(() => {
		console.log("Creating new client for model:", currentModel);
		const baseURL =
			currentModel === "deepseek"
				? "https://api.deepseek.com/v1"
				: "https://dashscope.aliyuncs.com/compatible-mode/v1";
		const apiKey =
			currentModel === "deepseek"
				? "sk-71b286b74c4f4285863d4e9f2861e8cb"
				: "sk-df7515632a19474e80715111c8440c5e";
		console.log("Using baseURL:", baseURL);
		return new OpenAI({
			baseURL,
			apiKey,
			dangerouslyAllowBrowser: true,
		});
	}, [currentModel]);

	const [agent] = useXAgent({
		request: async (info, callbacks) => {
			const { messages, message } = info;
			const { onSuccess, onUpdate } = callbacks;

			console.log("message", message);
			console.log("messages", messages);
			console.log(
				"🚀 ~ request: ~ client:",
				client,
				"currentModel:",
				currentModel,
			);

			let content: string = "";

			try {
				const stream = await client.chat.completions.create({
					model:
						currentModel === "deepseek"
							? "deepseek-reasoner"
							: "qwen-plus",
					messages: [{ role: "user", content: message ?? "" }],
					stream: true,
				});

				for await (const chunk of stream) {
					content += chunk.choices[0]?.delta?.content || "";
					onUpdate(content);
				}

				onSuccess(content);
			} catch (error) {
				console.log("🚀 ~ request: ~ error:", error);
				// handle error
				// onError();
			}
		},
	});

	const request = useCallback(async (info: any, callbacks: any) => {
		const { messages, message } = info;
		const { onSuccess, onUpdate } = callbacks;

		console.log("message", message);
		console.log("messages", messages);
		console.log(
			"🚀 ~ request: ~ client:",
			client,
			"currentModel:",
			currentModel,
		);

		let content: string = "";

		try {
			const stream = await client.chat.completions.create({
				model:
					currentModel === "deepseek"
						? "deepseek-reasoner"
						: "qwen-plus",
				messages: [{ role: "user", content: message ?? "" }],
				stream: true,
			});

			for await (const chunk of stream) {
				content += chunk.choices[0]?.delta?.content || "";
				onUpdate(content);
			}

			onSuccess(content);
		} catch (error) {
			console.log("🚀 ~ request: ~ error:", error);
			// handle error
			// onError();
		}
	}, [client, currentModel]);

	const { onRequest, messages } = useXChat({ agent: { request } });

	return (
		<Flex vertical gap="middle">
			<Flex justify="flex-end" style={{ marginBottom: "10px" }}>
				<Switch
					checkedChildren="Qwen"
					unCheckedChildren="Deepseek"
					checked={currentModel === "qwen"}
					onChange={(checked) => {
						console.log(
							"Switching to model:",
							checked ? "qwen" : "deepseek",
						);
						setCurrentModel(checked ? "qwen" : "deepseek");
					}}
				/>
			</Flex>
			<Bubble.List
				roles={roles}
				items={messages.map(({ id, message, status }) => ({
					key: id,
					role: status === "local" ? "local" : "ai",
					content: message,
					messageRender: renderMarkdown,
				}))}
				autoScroll={true}
				style={{
					overflowY: "auto",
					maxHeight: "80vh",
					scrollbarWidth: "none", // Firefox
					msOverflowStyle: "none", // IE 10+
				}}
			/>
			<Sender
				loading={agent.isRequesting()}
				value={content}
				onChange={setContent}
				onSubmit={(nextContent) => {
					onRequest(nextContent);
					setContent("");
				}}
			/>
		</Flex>
	);
};

export default Chat;
