module.exports = {
	entry: {
		bundle: "./src/index.tsx",
	},
	mode: "development",
	output: {
		filename: "[name].js",
		globalObject: 'this',
		library: "Halicarnassus",
		libraryTarget: "umd",
		path: __dirname + "/dist",
		publicPath: "/dist/",
	},
	resolve: {
		extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js"]
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				loader: "ts-loader",
				options: { configFile: "tsconfig.json" },
			}
		]
	}
};
