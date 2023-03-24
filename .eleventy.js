const { minify } = require("terser");

module.exports = function (eleventyConfig) {
	eleventyConfig.addPassthroughCopy("src/assets");
	eleventyConfig.addNunjucksAsyncFilter("jsmin", jsmin);

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
