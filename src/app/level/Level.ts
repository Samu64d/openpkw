//
// Level.ts
//

import Nullable from "../../engine/core/common/Nullable.ts";
import Supplier from "../../engine/core/common/Supplier.ts";
import ByteBuffer from "../../engine/core/io/buffer/ByteBuffer.ts";
import OpenMode from "../../engine/core/io/file/OpenMode.ts";
import File from "../../engine/core/io/file/File.ts";
import FileHandler from "../../engine/core/io/file/FileHandler.ts";
import StringByteDecoder from "../../engine/core/codec/StringByteDecoder.ts";
import Record from "../../engine/core/reflection/decorators/Record.ts";
import InvalidOperationException from "../../engine/core/exception/InvalidOperationException.ts";
import MapDefinition from "./MapDefinition.ts";

@Record()
class Level {

	public static readonly BUILDER: Supplier<Level.Builder> = (): Level.Builder => {
		return new Level.Builder();
	};

	private readonly name: string;
	private readonly map: MapDefinition;

	public constructor(name: string, map: MapDefinition) {
		this.name = name;
		this.map = map;
	}

	public getName(): string {
		return this.name;
	}

	public getMap(): MapDefinition {
		return this.map;
	}

}

namespace Level {

	export class Builder {

		private static loadMapFile(filePath: string): MapDefinition {
			const fileHandler: FileHandler = File.open(filePath, OpenMode.READ);
			const byteBuffer: ByteBuffer = fileHandler.read(fileHandler.getSize());
			const text: string = new StringByteDecoder().decode(byteBuffer);
			const object: object = JSON.parse(text) as object;

			fileHandler.dispose();
			byteBuffer.dispose();
			return object as MapDefinition;
		}

		private levelName: Nullable<string>;
		private mapName: Nullable<string>;

		public constructor() {
			this.levelName = null;
			this.mapName = null;
		}

		public withName(levelName: string): this {
			this.levelName = levelName;
			return this;
		}

		public withMap(mapName: string): this {
			this.mapName = mapName;
			return this;
		}

		public build(): Level {
			if (this.levelName == null) {
				throw new InvalidOperationException("Level name was not provided");
			}

			const map: MapDefinition = Builder.loadMapFile(this.getMapFilePath());

			return new Level(this.levelName, map);
		}

		private getMapFilePath(): string {
			if (this.mapName == null) {
				throw new InvalidOperationException("Map name was not provided");
			}

			return "./resources/map/" + this.mapName + ".json";
		}

	}

}

export default Level;
