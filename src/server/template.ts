const pkg = require('../../package.json')

const template = (body: string): string =>
`<!DOCTYPE html>
<html>
	<head>
		<title>Halicarnassus ${pkg.version}</title>
		<link rel="stylesheet" href="https://openlayers.org/en/v4.6.5/css/ol.css" type="text/css">
		<link rel="stylesheet" href="/civslog-map/civslog-map.css" type="text/css">
		<script src="/build/client/bundle.js"></script>
		<style>
			html, body {
				height: 100%;
				margin: 0;
				padding: 0;
				width: 100%;
			}
			#container {
				height: 100%;
				width: 100%;
			}
			#timeline {}
			#map {}
			#iframe-container,
			#iframe-left-container {
				position: fixed;
				top: 2em;
				left: calc(50vw + 1.5em);
				right: 2em;
				height: calc(100vh - 4em);
				z-index: 999;
				border-radius: 0.5em;
				box-shadow: 0px 0px 8px #868686;
				border: 0;
			}
			#iframe-left-container {
				right: calc(50vw + 1.5em);
				left: 2em;
			}
			#iframe-container .menu,
			#iframe-left-container .menu {
				background-color: black;
				border-top-left-radius: .5em;
				border-top-right-radius: .5em;
				color: white;
				height: 3em;
				list-style: none;
				margin: 0;
				padding: 0;
				text-align: right;
			}
			#iframe-container .menu li,
			#iframe-left-container .menu li {
				display: inline-block;
				font-size: 2em;
				line-height: 1.5em;
				margin: 0 1em;
			}
			#iframe-container iframe,
			#iframe-left-container iframe {
				border: 0;
				border-bottom-left-radius: .5em;
				border-bottom-right-radius: .5em;
				height: calc(100% - 3em);
				width: 100%;
			}

			.hire-forms-select .input-container {
				cursor: pointer;
				display: grid;
				grid-template-columns: 60% 40%;
			}

			.hire-forms-select .input-container .input {
				color: white;
				text-align: right;
			}

			.hire-forms-select .input-container button {
				color: white;
				border: none;
				background: none;
			}

			.hire-forms-select ul.hire-options {
				position: absolute;
				margin: 0;
				padding: 0;
				list-style: none;
				text-align: right;
				width: 60px;
			}
		</style>
	</head>
	<body>
		<div id="container"></div>
		${``/*<aside id="iframe-left-container"></aside>*/}
		${``/*<aside id="iframe-container"></aside>*/}
		${process.env.NODE_ENV === 'development' ? '<script src="/reload/reload.js"></script>' : ''}
	</body>
</html>`

export default template