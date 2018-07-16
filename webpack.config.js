module.exports = {
	entry: {
		bundle: "./src/client/index.tsx",
	},
	output: {
		filename: "[name].js",
		path: __dirname + "/build/client",
	},
	resolve: {
		// Add '.ts' and '.tsx' as resolvable extensions.
		extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js"]
	},
	module: {
		rules: [
			// All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
			{
				test: /\.tsx?$/,
				loader: "ts-loader",
				options: { configFile: "tsconfig.client.json" },
			}
		]
	}
};
