import { useXAgent, useXChat, Sender, Bubble } from "@ant-design/x";
import { UserOutlined } from "@ant-design/icons";
import type { BubbleProps } from "@ant-design/x";
import OpenAI from "openai";
import { Flex, type GetProp, Typography, Space, Spin } from "antd";
import React from "react";
import "./App.css";
import markdownit from "markdown-it";
const md = markdownit({ html: true, breaks: true });

const client = new OpenAI({
	baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
	// 模型名称

	// apiKey: import.meta.env.VITE_DEEPSEEK_API_KEY,
	apiKey: "sk-df7515632a19474e80715111c8440c5e",
	dangerouslyAllowBrowser: true,
});
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
const App: React.FC = () => {
	const [content, setContent] = React.useState("");

	const [agent] = useXAgent({
		request: async (info, callbacks) => {
			const { messages, message } = info;

			const { onSuccess, onUpdate } = callbacks;

			// current message
			console.log("message", message);

			// history messages
			console.log("messages", messages);

			let content: string = "";

			try {
				const stream = await client.chat.completions.create({
					model: "qwen-plus",
					// if chat context is needed, modify the array
					messages: [{ role: "user", content: message ?? "" }],
					// stream mode
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

	const {
		// use to send message
		onRequest,
		// use to render messages
		messages,
	} = useXChat({ agent });

	return (
		<Flex vertical gap="middle">
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

export default App;
