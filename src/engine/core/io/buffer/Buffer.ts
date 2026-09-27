//
// Buffer.ts
//

import Capacity from "../../memory/Capacity.ts";
import SpanAccessor from "./SpanAccessor.ts";

export default abstract class Buffer extends Capacity implements SpanAccessor<number> {

	public constructor(capacity: number, resizable: boolean = false) {
		super(capacity, resizable);
	}

	public abstract get(position: number): number;

	public abstract set(position: number, value: number): void;

}
