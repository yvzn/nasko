import { minify } from "terser";
import { compileString } from "sass";
import pugPlugin from "@11ty/eleventy-plugin-pug";
import { readFile } from 'fs/promises';

export default async function (eleventyConfig) {
	eleventyConfig.addNunjucksAsyncFilter("jsmin", jsmin);
	eleventyConfig.addFilter("toWeekNumber", toWeekNumber);
	eleventyConfig.addPassthroughCopy("src/assets");
	// only some selected JS files are copied, the rest are inlined directly in pages
	eleventyConfig.addPassthroughCopy("src/service-worker.js");
	eleventyConfig.addPassthroughCopy("src/js/swipe.js");
	eleventyConfig.addPassthroughCopy('src/.htaccess.sample');
	eleventyConfig.addPassthroughCopy('src/robots.txt');
	eleventyConfig.addTemplateFormats("scss");

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

	await eleventyConfig.addPlugin(pugPlugin);
	await eleventyConfig.addPlugin(setDevServerOptions);

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

async function setDevServerOptions(eleventyConfig) {
	const options = { liveReload: false };
	const htaccess = await readFile('src/.htaccess.sample', 'utf8');

	const headers = htaccess.split('\n').reduce((acc, line) => {
		const match = line.match(/Header set (\S+) "(.+?)"/);
		if (match) {
			const [, name, value] = match;
			acc[name] = value;
		}
		return acc;
	}, {});

	console.log('default headers: ', headers);

	eleventyConfig.setServerOptions({
		...options,
		headers: headers,
	})
}
