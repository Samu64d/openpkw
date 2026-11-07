//
// Props.ts
//

import Exception from "../../engine/core/exception/Exception.ts";
import Prop from "./Prop.ts";

export default class Props {

	public static registryAll(): void {
		Props.registry(Props.TREE_0);
		Props.registry(Props.TREE_1);
		Props.registry(Props.TREE_2);
		Props.registry(Props.SIGN_0);
		Props.registry(Props.PLANTAR_0);
		Props.registry(Props.TRASH_BIN_0);
		Props.registry(Props.TABLE_0);
		Props.registry(Props.PARASOL_0);
		Props.registry(Props.TRACK_HOUSE_0);
		Props.registry(Props.HOUSE_0);
		Props.registry(Props.HOUSE_1);
		Props.registry(Props.HOUSE_2);
		Props.registry(Props.HOUSE_3);
		Props.registry(Props.HOUSE_4);
	}

	public static get(propName: string): Prop {
		if (Props.PROP_MAP.has(propName) == false) {
			throw new Exception("Unknown prop name");
		}

		return Props.PROP_MAP.get(propName) as Prop;
	}

	public static getAll(): Map<string, Prop> {
		return Props.PROP_MAP;
	}

	private static readonly TREE_0: Prop.Builder = Prop.BUILDER()
		.withName("tree_0")
		.withModel("tree_0")
		.withTexture("tree_0")
		.withProgram("tree");

	private static readonly TREE_1: Prop.Builder = Prop.BUILDER()
		.withName("tree_1")
		.withModel("tree_1")
		.withTexture("tree_1")
		.withProgram("tree");

	private static readonly TREE_2: Prop.Builder = Prop.BUILDER()
		.withName("tree_2")
		.withModel("tree_2")
		.withTexture("tree_2")
		.withProgram("tree");

	private static readonly SIGN_0: Prop.Builder = Prop.BUILDER()
		.withName("sign_0")
		.withModel("sign_0")
		.withTexture("sign_0");

	private static readonly PLANTAR_0: Prop.Builder = Prop.BUILDER()
		.withName("plantar_0")
		.withModel("plantar_0")
		.withTexture("plantar_0");

	private static readonly TRASH_BIN_0: Prop.Builder = Prop.BUILDER()
		.withName("trash_bin_0")
		.withModel("trash_bin_0")
		.withTexture("trash_bin_0");

	private static readonly TABLE_0: Prop.Builder = Prop.BUILDER()
		.withName("table_0")
		.withModel("table_0")
		.withTexture("table_0");

	private static readonly PARASOL_0: Prop.Builder = Prop.BUILDER()
		.withName("parasol_0")
		.withModel("parasol_0")
		.withTexture("parasol_0");

	private static readonly TRACK_HOUSE_0: Prop.Builder = Prop.BUILDER()
		.withName("track_house_0")
		.withModel("track_house_0")
		.withTexture("track_house_0");

	private static readonly HOUSE_0: Prop.Builder = Prop.BUILDER()
		.withName("house_0")
		.withModel("house_0")
		.withTexture("house_0");

	private static readonly HOUSE_1: Prop.Builder = Prop.BUILDER()
		.withName("house_1")
		.withModel("house_1")
		.withTexture("house_1");

	private static readonly HOUSE_2: Prop.Builder = Prop.BUILDER()
		.withName("house_2")
		.withModel("house_2")
		.withTexture("house_2");

	private static readonly HOUSE_3: Prop.Builder = Prop.BUILDER()
		.withName("house_3")
		.withModel("house_3")
		.withTexture("house_3");

	private static readonly HOUSE_4: Prop.Builder = Prop.BUILDER()
		.withName("house_4")
		.withModel("house_4")
		.withTexture("house_4");

	private static readonly PROP_MAP: Map<string, Prop> = new Map<string, Prop>();

	private static registry(builder: Prop.Builder): void {
		const prop: Prop = builder.build();
		const propName: string = prop.getName();

		if (Props.PROP_MAP.has(propName) == true) {
			throw new Exception("Another prop was already registered with the same name");
		}

		Props.PROP_MAP.set(propName, prop);
	}

	private constructor() {
	}

}
