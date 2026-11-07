//
// Programs.ts
//

import Exception from "../../engine/core/exception/Exception.ts";
import Program from "./Program.ts";

export default class Programs {

	public static registryAll(): void {
		Programs.registry(Programs.TERRAIN);
		Programs.registry(Programs.TREE);
	}

	public static get(programName: string): Program {
		if (Programs.PROGRAM_MAP.has(programName) == false) {
			throw new Exception("Unknown program name");
		}

		return Programs.PROGRAM_MAP.get(programName) as Program;
	}

	public static getAll(): Map<string, Program> {
		return Programs.PROGRAM_MAP;
	}

	private static readonly TERRAIN: Program.Builder = Program.BUILDER()
		.withName("terrain")
		.withVertexShader("terrain")
		.withFragmentShader("terrain");

	private static readonly TREE: Program.Builder = Program.BUILDER()
		.withName("tree")
		.withVertexShader("tree")
		.withFragmentShader("tree");

	private static readonly PROGRAM_MAP: Map<string, Program> = new Map<string, Program>();

	private static registry(builder: Program.Builder): void {
		const program: Program = builder.build();
		const programName: string = program.getName();

		if (Programs.PROGRAM_MAP.has(programName) == true) {
			throw new Exception("Another program was already registered with the same name");
		}

		Programs.PROGRAM_MAP.set(programName, program);
	}

	private constructor() {
	}

}
