//
// PoolAllocator.ts
//

import Nullable from "../common/Nullable.ts";
import Pool from "./Pool.ts";
import Allocator from "./Allocator.ts";

export default abstract class PoolAllocator<T extends object> implements Allocator<T> {

	protected readonly minPoolCapacity: number;
	protected readonly maxPoolCapacity: number;

	public constructor(minPoolCapacity: number, maxPoolCapacity: number) {
		if (minPoolCapacity < 1) {
			throw new Error("Minimum pool capacity must be at least 1: got " + minPoolCapacity + ".");
		}
		if (minPoolCapacity > maxPoolCapacity) {
			throw new Error("Minimum pool capacity cannot be greater than maximum pool capacity: got min " + minPoolCapacity + ", max " + maxPoolCapacity + ".");
		}

		this.minPoolCapacity = minPoolCapacity;
		this.maxPoolCapacity = maxPoolCapacity;
	}

	public getMinPoolCapacity(): number {
		return this.minPoolCapacity;
	}

	public getMaxPoolCapacity(): number {
		return this.maxPoolCapacity;
	}

	public abstract malloc(size: number): Nullable<T>;

	public abstract free(item: T): void;

	protected tryAcquireItemFromPool(pool: Pool<T>): Nullable<T> {
		if (pool.getAvailableItemCount() == 0) {
			return null;
		}

		return pool.acquireItem();
	}

	protected tryIncreasePoolCapacity(pool: Pool<T>): boolean {
		const capacity: number = pool.getCapacity();

		if (capacity >= this.maxPoolCapacity) {
			return false;
		}

		const delta: number = Math.min(capacity, this.maxPoolCapacity - capacity);

		pool.grow(delta);
		return true;
	}

}
