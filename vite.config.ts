/*
 * @Author: gongxi33
 * @Date: 2025-04-08 16:52:48
 * @LastEditTime: 2025-06-03 11:30:49
 * @LastEditors: gongxi33
 * @Description:
 * @FilePath: /antdx-demo/vite.config.ts
 */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	server: {
		proxy: {
			"/api": {
				target: "http://47.94.59.81:8089",
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/api/, ""),
			},
		},
	},
});
