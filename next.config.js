const withPlugins = require("next-compose-plugins");
const path = require("path");
const SWPrecacheWebpackPlugin = require("sw-precache-webpack-plugin");
const images = require("next-images");
const graphql = require("next-plugin-graphql");
const optimizedImages = require("next-optimized-images");

const nextConfig = {
	webpack: (config, { dev }) => {
		/**
		 * Install and Update our Service worker
		 * on our main entry file :)
		 * Reason: https://github.com/ooade/NextSimpleStarter/issues/32
		 */
		const oldEntry = config.entry;

		config.entry = () =>
			oldEntry().then(entry => {
				entry["main.js"] &&
					entry["main.js"].push(path.resolve("./utils/offline"));
				return entry;
			});

		/* Enable only in Production */
		if (!dev) {
			// Service Worker
			config.plugins.push(
				new SWPrecacheWebpackPlugin({
					cacheId: "next-ss",
					filepath: "./static/sw.js",
					minify: true,
					staticFileGlobsIgnorePatterns: [/\.next\//],
					staticFileGlobs: [
						"static/**/*" // Precache all static files by default
					],
					runtimeCaching: [
						// Example with different handlers
						{
							handler: "fastest",
							urlPattern: /[.](png|jpg|css)/
						},
						{
							handler: "networkFirst",
							urlPattern: /^http.*/ //cache all files
						}
					]
				})
			);
		}

		return config;
	}
};

module.exports = withPlugins(
	[
		images,
		graphql,
		[
			optimizedImages,
			{
				// these are the default values so you don't have to provide them if they are good enough for your use-case.
				// but you can overwrite them here with any valid value you want.
				inlineImageLimit: 8192,
				imagesFolder: "images",
				imagesName: "[name]-[hash].[ext]",
				optimizeImagesInDev: false,
				mozjpeg: {
					quality: 80
				},
				optipng: {
					optimizationLevel: 3
				},
				pngquant: false,
				gifsicle: {
					interlaced: true,
					optimizationLevel: 3
				},
				svgo: {
					// enable/disable svgo plugins here
				},
				webp: {
					preset: "default",
					quality: 75
				}
			}
		]
	],
	nextConfig
);
