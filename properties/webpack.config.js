//
// webpack.config.js
//

import path from "path";

/** @type {import("webpack").Configuration} **/
export default [
	{
		entry: "..\\src\\Main.ts",
		mode: "development",
		module: {
			rules: [
				{
					exclude: /node_modules/,
					loader: "ts-loader",
					options: {
						configFile: path.resolve(import.meta.dirname, ".\\tsconfig.json"),
						transpileOnly: true
					},
					test: /\.ts$/
				}
			]
		},
		output: {
			filename: "Main.cjs",
			path: path.resolve(import.meta.dirname, "..\\build\\lib")
		},
		target: "electron-main"
	},
	{
		entry: "..\\src\\MainRenderer.ts",
		mode: "development",
		module: {
			rules: [
				{
					exclude: /node_modules/,
					loader: "ts-loader",
					options: {
						configFile: path.resolve(import.meta.dirname, ".\\tsconfig.json"),
						transpileOnly: true
					},
					test: /\.ts|.tsx$/
				}
			]
		},
		output: {
			filename: "Renderer.js",
			path: path.resolve(import.meta.dirname, "..\\build\\lib")
		},
		target: "electron-renderer"
	}
];
