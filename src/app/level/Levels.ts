//
// Levels.ts
//

import Exception from "../../engine/core/exception/Exception.ts";
import Level from "./Level.ts";

export default class Levels {

	public static registryAll(): void {
		Levels.registry(Levels.LEVEL_0);
	}

	public static get(levelName: string): Level {
		if (Levels.LEVEL_MAP.has(levelName) == false) {
			throw new Exception("Unknown level name");
		}

		return Levels.LEVEL_MAP.get(levelName) as Level;
	}

	public static getAll(): Map<string, Level> {
		return Levels.LEVEL_MAP;
	}

	private static readonly LEVEL_0: Level.Builder = Level.BUILDER()
		.withName("level_0")
		.withMap("map_0")

	private static readonly LEVEL_MAP: Map<string, Level> = new Map<string, Level>();

	private static registry(builder: Level.Builder): void {
		const level: Level = builder.build();
		const levelName: string = level.getName();

		if (Levels.LEVEL_MAP.has(levelName) == true) {
			throw new Exception("Another level was already registered with the same name");
		}

		Levels.LEVEL_MAP.set(levelName, level);
	}

	private constructor() {
	}

}
