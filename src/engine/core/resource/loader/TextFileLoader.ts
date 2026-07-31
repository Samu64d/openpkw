//
// TextFileResource.ts
//

import Encoding from "../../io/file/TextEncoding.ts";
import File from "../../io/file/File.ts";
import Text from "../resource/Text.ts";
import Loader from "./Loader.ts";

export default class TextFileLoader implements Loader<string, Text> {

	private readonly encoding: Encoding;

	public constructor(encoding: Encoding = Encoding.UTF_8) {
		this.encoding = encoding;
	}

	public load(path: string): Text {
		const fileContent: string = File.readText(path, this.encoding);
		return new Text(fileContent);
	}

}
