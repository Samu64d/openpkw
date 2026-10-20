//
// Pool.ts
//

import Exception from "../exception/Exception.ts";
import ArgumentException from "../exception/ArgumentException.ts";
import ArgumentOutOfRangeException from "../exception/ArgumentOutOfRangeException.ts";
import InvalidOperationException from "../exception/InvalidOperationException.ts";
import Capacity from "./Capacity.ts";

class Pool<T extends object> extends Capacity {

	public static readonly EMPTY: <T extends object>(capacity: number) => Pool<T> = <T extends object>(capacity: number): Pool<T> => {
		const itemList: T[] = new Array<T>();
		return new Pool(capacity, itemList);
	};

	private readonly availableItemStack: T[];
	private readonly itemMap: Map<T, Pool.ItemState>;

	public constructor(capacity: number, initialItemList: T[]) {
		ArgumentOutOfRangeException.throwIfLessThan(capacity, initialItemList.length, "capacity");
		super(capacity, true);

		this.availableItemStack = new Array<T>();
		this.itemMap = new Map<T, Pool.ItemState>();

		for (const item of initialItemList) {
			this.addItem(item);
		}
	}

	public override shrink(length: number): void {
		ArgumentOutOfRangeException.throwIfGreaterThan(this.getRemainingCapacity(), length, "remainingCapacity");

		super.shrink(length);
	}

	public addItem(item: T): void {
		if (this.hasItem(item) == true) {
			throw new InvalidOperationException("Cannot add item into pool: item was already added");
		}
		if (this.getRemainingCapacity() == 0) {
			throw new Exception("Cannot add item into pool: pool is full");
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
			throw new Exception("Cannot acquire item from pool: no items are available");
		}

		const item: T = this.availableItemStack.pop() as T;

		this.itemMap.set(item, Pool.ItemState.ACQUIRED);
		return item;
	}

	public releaseItem(item: T): void {
		if (this.hasItem(item) == false) {
			throw new ArgumentException("Reference is not a valid pool item", "item");
		}

		const state: Pool.ItemState = this.itemMap.get(item) as Pool.ItemState;

		if (state != Pool.ItemState.ACQUIRED) {
			throw new InvalidOperationException("Cannot release an item that is already available");
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
