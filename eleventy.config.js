import { minify } from "terser"
import { compileString } from "sass"
import pugPlugin from "@11ty/eleventy-plugin-pug";

export default function (eleventyConfig) {
	eleventyConfig.addNunjucksAsyncFilter("jsmin", jsmin)
	eleventyConfig.addFilter("toWeekNumber", toWeekNumber)
	eleventyConfig.addPassthroughCopy("src/assets")
	// only some selected JS files are copied, the rest are inlined directly in pages
	eleventyConfig.addPassthroughCopy("src/service-worker.js")
	eleventyConfig.addPassthroughCopy("src/js/swipe.js")
	eleventyConfig.addTemplateFormats("scss")

	eleventyConfig.addExtension("scss", {
		outputFileExtension: "css",

		compile: async function (inputContent) {
			const result = compileString(inputContent, { sourceMap: false })
			return async () => {
				return result.css
			}
		}
	})

	eleventyConfig.addCollection("articlesFrancaisTries", function (collectionApi) {
		return collectionApi.getFilteredByTag("article_francais").sort(function (a, b) {
			return b.data.daysLeft - a.data.daysLeft
		})
	})

	eleventyConfig.addPlugin(pugPlugin);

	// Return your Object options:
	return {
		dir: {
			input: "src",
		}
	}
}

async function jsmin(code, callback) {
	try {
		const minified = await minify(code)
		callback(null, minified.code)
	} catch (error) {
		console.error("Terser error: ", error)
		// Fail gracefully.
		callback(null, code)
	}
}

function toWeekNumber(days) {
	var weekNumber = Math.floor(days / 7)
	return Math.max(weekNumber, 0)
}
