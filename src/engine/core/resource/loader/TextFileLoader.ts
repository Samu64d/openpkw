//
// TextFileLoader.ts
//

import TextEncoding from "../../memory/TextEncoding.ts";
import File from "../../io/file/File.ts";
import Text from "../resource/Text.ts";
import Loader from "./Loader.ts";

export default class TextFileLoader implements Loader<string, Text> {

	private readonly textEncoding: TextEncoding;

	public constructor(encoding: TextEncoding = TextEncoding.UTF_8) {
		this.textEncoding = encoding;
	}

	public load(path: string): Text {
		const fileContent: string = File.readText(path, this.textEncoding);
		return new Text(fileContent);
	}

}
