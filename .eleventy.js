const { minify } = require("terser");
const sass = require("sass");

module.exports = function (eleventyConfig) {
	eleventyConfig.addNunjucksAsyncFilter("jsmin", jsmin);
	eleventyConfig.addPassthroughCopy("src/assets");
	eleventyConfig.addTemplateFormats("scss");

	eleventyConfig.addExtension("scss", {
		outputFileExtension: "css",

		compile: async function (inputContent) {
			const result = sass.compileString(inputContent, { sourceMap: false });
			return async () => {
				return result.css;
			};
		}
	});

	eleventyConfig.addCollection("articlesFrancaisTries", function (collectionApi) {
		return collectionApi.getFilteredByTag("article_francais").sort(function (a, b) {
			return b.data.daysLeft - a.data.daysLeft
		})
	});

	// Return your Object options:
	return {
		dir: {
			input: "src",
		}
	}
};

async function jsmin(code, callback) {
	try {
		const minified = await minify(code);
		callback(null, minified.code);
	} catch (error) {
		console.error("Terser error: ", error);
		// Fail gracefully.
		callback(null, code);
	}
}
