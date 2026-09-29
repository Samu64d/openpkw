//
// Pool.ts
//

import Capacity from "./Capacity.ts";

class Pool<T extends object> extends Capacity {

	public static readonly EMPTY: <T extends object>(capacity: number) => Pool<T> = <T extends object>(capacity: number): Pool<T> => {
		const itemList: T[] = new Array<T>();
		return new Pool(capacity, itemList);
	};

	private readonly availableItemStack: T[];
	private readonly itemMap: Map<T, Pool.ItemState>;

	public constructor(capacity: number, initialItemList: T[]) {
		super(capacity, true);

		if (capacity < initialItemList.length) {
			throw new Error("Initial item list length value cannot exceed pool capacity value: got capacity " + capacity + ", length " + initialItemList.length + ".");
		}

		this.availableItemStack = new Array<T>();
		this.itemMap = new Map<T, Pool.ItemState>();

		for (const item of initialItemList) {
			this.addItem(item);
		}
	}

	public override shrink(length: number): void {
		const remainingCapacity: number = this.getRemainingCapacity();

		if (remainingCapacity < length) {
			throw new Error("Cannot shrink pool below the current registered item count: got capacity " + (this.capacity - length) + ", registered item count " + this.itemMap.size + ".");
		}

		super.shrink(length);
	}

	public addItem(item: T): void {
		if (this.hasItem(item) == true) {
			throw new Error("Cannot add new item to the pool: item was already added.");
		}
		if (this.getRemainingCapacity() == 0) {
			throw new Error("Cannot add new item to the pool: pool is full.");
		}

		this.availableItemStack.push(item);
		this.itemMap.set(item, Pool.ItemState.AVAILABLE);
	}

	public hasItem(item: T): boolean {
		return this.itemMap.has(item);
	}

	public getRemainingCapacity(): number {
		return Math.max(0, this.capacity - this.itemMap.size);
	}

	public getAvailableItemCount(): number {
		return this.availableItemStack.length;
	}

	public acquireItem(): T {
		if (this.getAvailableItemCount() == 0) {
			throw new Error("Cannot acquire item from pool: no items are available.");
		}

		const item: T = this.availableItemStack.pop() as T;

		this.itemMap.set(item, Pool.ItemState.ACQUIRED);
		return item;
	}

	public releaseItem(item: T): void {
		if (this.hasItem(item) == false) {
			throw new Error("Invalid item reference.");
		}

		const state: Pool.ItemState = this.itemMap.get(item) as Pool.ItemState;

		if (state != Pool.ItemState.ACQUIRED) {
			throw new Error("Cannot release item: item is already available.");
		}

		this.availableItemStack.push(item);
		this.itemMap.set(item, Pool.ItemState.AVAILABLE);
	}

}

namespace Pool {

	export const enum ItemState {
		AVAILABLE,
		ACQUIRED
	}

}

export default Pool;
