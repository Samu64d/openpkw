//
// ObjFileLoader.ts
//

import TextEncoding from "../../memory/TextEncoding.ts";
import File from "../../io/file/File.ts";
import Loader from "./Loader.ts";
import Mesh from "../resource/Mesh.ts";

export default class ObjFileLoader implements Loader<string, Mesh> {

	private readonly textEncoding: TextEncoding;

	public constructor(encoding: TextEncoding = TextEncoding.UTF_8) {
		this.textEncoding = encoding;
	}

	public load(path: string): Mesh {
		const fileContent: string = File.readText(path, this.textEncoding);
		const v: number[] = [];
		const i: number[] = [];

		// Very crappy test
		const lines: string[] = fileContent.split("\n");
		let index = 0;
		for (const line of lines) {
			if (line.startsWith("v ")) {
				const values = line.split(" ");
				v.push(
					Number(values[1]),
					Number(values[2]),
					Number(values[3]),
					0,
					0
				)
				index += 5;
			}
		}

		index = 0;
		for (const line of lines) {
			if (line.startsWith("f ")) {
				const values = line.split(" ");
				i.push(
					Number(values[1].split("/")[0]) - 1,
					Number(values[2].split("/")[0]) - 1,
					Number(values[3].split("/")[0]) - 1,
				);
				index += 3;
			}
		}

		return new Mesh(new Float32Array(v), new Uint16Array(i));
	}

}
