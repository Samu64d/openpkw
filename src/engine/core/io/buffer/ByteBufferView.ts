//
// ByteBufferView.ts
//

import Disposable from "../../reflection/decorators/Disposable.ts";
import ByteBuffer from "./ByteBuffer.ts";

@Disposable()
export default class ByteBufferView extends ByteBuffer implements Disposable.Target {

	private readonly parent: ByteBuffer;

	public constructor(source: ByteBuffer, start: number, end: number) {
		super(source.unsafeGetSource().subarray(start, end), end - start, false);

		this.parent = source;
	}

	public getParent(): ByteBuffer {
		return this.parent;
	}

	public override dispose(): void {
		super.dispose();
		this.parent.removeView(this);
	}

}
