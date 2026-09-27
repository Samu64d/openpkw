//
// ImmutableByteBuffer.ts
//

import Disposable from "../../reflection/decorators/Disposable.ts";
import BaseByteBuffer from "./BaseByteBuffer.ts";

@Disposable()
class ImmutableByteBuffer extends BaseByteBuffer implements Disposable.Target {

	public static readonly OF: (byteBuffer: BaseByteBuffer) => ImmutableByteBuffer = (byteBuffer: BaseByteBuffer): ImmutableByteBuffer => {
		const capacity: number = byteBuffer.getCapacity();
		const uint8Array: Uint8Array = ImmutableByteBuffer.allocateUint8Array(capacity, 0);
		uint8Array.set(byteBuffer.unsafeGetData());
		Object.freeze(uint8Array);

		return new ImmutableByteBuffer(uint8Array, capacity);
	};

	private readonly viewSet: Set<ImmutableByteBuffer.View>;

	public constructor(data: Uint8Array, capacity: number) {
		super(data, capacity);
		this.viewSet = new Set<ImmutableByteBuffer.View>();
	}

	public override unsafeGetData(): Readonly<Uint8Array> {
		return this.data.subarray(0, this.capacity);
	}

	public view(start: number = 0, end: number = this.capacity): ImmutableByteBuffer.View {
		if (this.isRangeWithinBounds(start, end - start) == false) {
			throw new Error("Out of bounds access.");
		}

		const view: ImmutableByteBuffer.View = new ImmutableByteBuffer.View(this, start, end);

		this.viewSet.add(view);
		return view;
	}

	public removeView(view: ImmutableByteBuffer.View): void {
		this.viewSet.delete(view);
	}

	public dispose(): void {
		for (const view of this.viewSet) {
			if (Disposable.isDisposed(view) == false) {
				view.dispose();
			}
		}

		if ((this instanceof ImmutableByteBuffer.View) == false) {
			ImmutableByteBuffer.freeUint8Array(this.data);
		}
	}

}

namespace ImmutableByteBuffer {

	export class View extends ImmutableByteBuffer {

		private readonly parent: ImmutableByteBuffer;

		public constructor(source: ImmutableByteBuffer, start: number, end: number) {
			const subData: Uint8Array = source.unsafeGetData().subarray(start, end);
			super(subData, end - start);
			this.parent = source;
		}

		public getParent(): ImmutableByteBuffer {
			return this.parent;
		}

		public override dispose(): void {
			super.dispose();
			this.parent.removeView(this);
		}

	}

}

export default ImmutableByteBuffer;
