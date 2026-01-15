import { resources, sys } from "cc";
import { EDITOR } from "cc/env";
import { PlayableSDK } from "./PlayableSDK";
const DEFAULT_LANG_PATH = "texture/lang";
export class Language {
	private static languageCode = null;

	/**
	 * 语言代码-->文件夹名 映射表，根据项目支持语言调整
	 */
	private static languageCodeMap = /**inject_start*/{
		"zh-tw": "zh-tw",
		"zh-hk": "zh-tw",
		"zh": "zh-tw",
		"de": "de",
		"ja": "ja",
		"fr": "fr",
		"ko": "ko",
		"ru": "ru",
		"en": "en",
		"es": "es",
		"tr": "tr",
		"ar": "ar"
	}/**inject_end*/;

	/**
	 * 初始化语言，确保初始化完成后再进入游戏，否则可能出现图片闪烁一下
	 * @param rootDir 资源根目录
	 * @param endCall 初始化完成回调
	 */
	public static init(rootDir = null, endCall?) {
		if (!this.languageCode) {
			this.getLanguageCode();
		}

		if (!rootDir) {
			rootDir = DEFAULT_LANG_PATH;
		}
		resources.loadDir(rootDir + '/' + this.languageCode, () => {
			endCall && endCall();
		})
	}
	public static initASync(rootDir = null) {
		return new Promise<void>((resolve, reject) => {
			Language.init(rootDir, () => {
				resolve();
			});
		})
	}

	/**
	 * 获取当前语言代码
	 * @returns 当前语言代码
	 */
	public static getLanguageCode() {
		if (this.languageCode) return this.languageCode;

		let code = sys.languageCode;
		// console.log('========', code)

		let codeNum = "en";
		if (Language.languageCodeMap[code]) {
			codeNum = Language.languageCodeMap[code];
		} else {
			let mainCode = code.split("-")[0];
			if (Language.languageCodeMap[mainCode]) {
				codeNum = Language.languageCodeMap[mainCode];
			}
		}

		if (PlayableSDK.getGameConfs("isRU") == "1") {
			codeNum = "ru";
		}

		this.languageCode = codeNum;
		return this.languageCode;
	}
}

// if (EDITOR) {
// 	const Editor = window["Editor"];
// 	const rootDir = Editor.Project.path + "/assets/";
// 	const fs = window["require"]("fs");
// 	const path = window["require"]("path");

// 	function findLanguageTs(rootDir: string): string {
// 		const files = fs.readdirSync(rootDir, { withFileTypes: true });

// 		for (const file of files) {
// 			const fullPath: string = path.join(rootDir, file.name);

// 			if (file.isDirectory()) {
// 				const found = findLanguageTs(fullPath);
// 				if (found) return found; // 找到就立即返回
// 			} else {
// 				if (file.name === "Language.ts") {
// 					return fullPath;
// 				}
// 			}
// 		}
// 		return null;
// 	}

// 	(function () {
// 		let languageTS = findLanguageTs(rootDir);
// 		if (!languageTS) {
// 			return;
// 		}
// 		const content: string = fs.readFileSync(languageTS, 'utf8');

// 		const START_FLAG = "/**inject_start*/";
// 		const END_FLAG = "/**inject_end*/";

// 		let startIndex = content.indexOf(START_FLAG);
// 		if (startIndex == -1) return;
// 		startIndex += START_FLAG.length;

// 		let endIndex = content.indexOf(END_FLAG);
// 		if (endIndex == -1) return;


// 		let injectMap = {
// 			"zh-cn": "zh-cn",
// 			"zh-tw": "zh-tw",
// 			"zh-hk": "zh-tw",
// 			// "zh": "zh",
// 			"zh": "zh-tw",
// 			"de": "de",
// 			"ja": "ja",
// 			"fr": "fr",
// 			"ko": "ko",
// 			"ru": "ru",
// 			"en": "en",
// 			"es": "es",//西班牙
// 			"pt": "pt",//葡萄牙
// 			"it": "it",//意大利
// 			"tr": "tr",//土耳其
// 			"nl": "nl",//荷兰
// 			"pl": "pl",//波兰
// 			"hu": "hu",//匈牙利
// 			"ar": "ar",//阿拉伯
// 			"no": "no",//挪威
// 			"uk": "uk",//乌克兰
// 			"ro": "ro",//罗马尼亚
// 			"bg": "bg",//保加利亚
// 			"hi": "hi",//印度
// 		};

// 		let obj = {};
// 		let basePath = rootDir + "resources/" + DEFAULT_LANG_PATH + "/";
// 		for (let code in injectMap) {
// 			if (fs.existsSync(basePath + injectMap[code])) {
// 				obj[code] = injectMap[code];
// 			}
// 		}
// 		let str = JSON.stringify(obj,null,2);
// 		let finalStr = content.slice(0, startIndex) + str + content.slice(endIndex);
// 		fs.writeFileSync(languageTS, finalStr, 'utf8');
// 	})();
// }