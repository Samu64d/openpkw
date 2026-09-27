//
// Pool.ts
//

import Capacity from "./Capacity.ts";

class Pool<T> extends Capacity {

	public static readonly EMPTY: <T>(capacity: number) => Pool<T> = <T>(capacity: number): Pool<T> => {
		const itemList: T[] = new Array<T>();
		return new Pool(capacity, itemList);
	};

	private readonly itemStack: T[];
	private readonly itemRegistry: Map<T, Pool.PoolItemInfo<T>>;

	private constructor(capacity: number, initialItemList: T[]) {
		super(capacity, true);
		if (capacity < initialItemList.length) {
			throw new Error("Initial item list length value cannot exceed pool capacity value: got capacity " + capacity + ", length " + initialItemList.length + ".");
		}

		this.itemRegistry = new Map<T, Pool.PoolItemInfo<T>>();
		this.itemStack = Array.from(initialItemList);
	}

	public override shrink(length: number): void {
		if (this.capacity - length < this.itemStack.length) {
			throw new Error("Cannot shrink pool below current item count: got capacity " + (this.capacity - length) + ", item count " + this.itemStack.length + ".");
		}

		super.shrink(length);
	}

	public registerItem(item: T): void {
		if (this.isItemRegistered(item) == true) {
			throw new Error("Item is already registered.");
		}
		if (this.isFull() == true) {
			throw new Error("Cannot register item: pool is full.");
		}

		const poolItemInfo: Pool.PoolItemInfo<T> = new Pool.PoolItemInfo(item);

		this.itemStack.push(item);
		this.itemRegistry.set(item, poolItemInfo);
	}

	public isItemRegistered(item: T): boolean {
		return this.itemRegistry.has(item);
	}

	public isEmpty(): boolean {
		return this.itemStack.length == 0;
	}

	public isFull(): boolean {
		return this.itemStack.length == this.capacity;
	}

	public doubleCapacity(): void {
		this.grow(this.capacity);
	}

	public acquireItem(): T {
		if (this.isEmpty() == true) {
			throw new Error("Cannot acquire item: pool is empty.");
		}

		const item: T = this.itemStack.pop() as T;
		const poolItemInfo: Pool.PoolItemInfo<T> = this.itemRegistry.get(item) as Pool.PoolItemInfo<T>;

		poolItemInfo.setState(Pool.PoolItemState.ACQUIRED);
		return item;
	}

	public releaseItem(item: T): void {
		if (this.isItemRegistered(item) == false) {
			throw new Error("Invalid pool item reference.");
		}

		const poolItemInfo: Pool.PoolItemInfo<T> = this.itemRegistry.get(item) as Pool.PoolItemInfo<T>;

		if (poolItemInfo.getState() != Pool.PoolItemState.ACQUIRED) {
			throw new Error("Item was already released.");
		}

		this.itemStack.push(item);
		poolItemInfo.setState(Pool.PoolItemState.RELEASED);
	}

}

namespace Pool {

	export const enum PoolItemState {
		RELEASED,
		ACQUIRED
	}

	export class PoolItemInfo<T> {

		private readonly ref: T;
		private state: PoolItemState;

		public constructor(ref: T, state: PoolItemState = PoolItemState.RELEASED) {
			this.ref = ref;
			this.state = state;
		}

		public getRef(): T {
			return this.ref;
		}

		public getState(): PoolItemState {
			return this.state;
		}

		public setState(state: PoolItemState): void {
			this.state = state;
		}

	}

}

export default Pool;
