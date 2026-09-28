//
// SimplePoolAllocator.ts
//

import Nullable from "../common/Nullable.ts";
import Supplier from "../common/Supplier.ts";
import ClassType from "../reflection/class/ClassType.ts";
import Pool from "./Pool.ts";
import Allocator from "./Allocator.ts";

export default class SimplePoolAllocator<T extends object> implements Allocator<T> {

	public static createFactory<T extends object>(classType: ClassType.NoAbstract<T>): Supplier<T> {
		return (): T => {
			return new classType();
		}
	};

	private static readonly DEFAULT_INITIAL_POOL_CAPACITY: number = 32;

	private static readonly MAX_POOL_CAPACITY: number = 2048;

	private readonly factory: Supplier<T>;
	private readonly pool: Pool<T>;

	public constructor(factory: Supplier<T>, initialPoolCapacity: number = SimplePoolAllocator.DEFAULT_INITIAL_POOL_CAPACITY) {
		if (initialPoolCapacity < 1) {
			throw new Error("Initial pool capacity must be at least 1: got " + initialPoolCapacity + ".");
		}
		if (initialPoolCapacity > SimplePoolAllocator.MAX_POOL_CAPACITY) {
			throw new Error("Initial pool capacity cannot exceed " + SimplePoolAllocator.MAX_POOL_CAPACITY + ": got " + initialPoolCapacity + ".");
		}

		this.factory = factory;
		this.pool = Pool.EMPTY(initialPoolCapacity);
		this.fillPool(initialPoolCapacity);
	}

	public malloc(): Nullable<T> {
		while (true) {
			const item: Nullable<T> = this.tryAcquireFromPool();

			if (item != null) {
				return item;
			}

			if (this.tryGrowPool() == false) {
				return null;
			}
		}
	}

	public free(item: T): void {
		this.pool.releaseItem(item);
	}

	private allocateItem(): T {
		return this.factory();
	}

	private fillPool(itemCount: number): void {
		for (let i: number = 0; i < itemCount; i++) {
			const item: T = this.allocateItem();

			this.pool.registerItem(item);
		}
	}

	private tryAcquireFromPool(): Nullable<T> {
		if (this.pool.isEmpty() == true) {
			return null;
		}

		return this.pool.acquireItem();
	}

	private tryGrowPool(): boolean {
		const capacity: number = this.pool.getCapacity();

		if (capacity * 2 > SimplePoolAllocator.MAX_POOL_CAPACITY) {
			return false;
		}

		this.pool.doubleCapacity();
		this.fillPool(capacity);

		return true;
	}

}
