//
// SimplePoolAllocator.ts
//

import Nullable from "../common/Nullable.ts";
import ClassType from "../reflection/class/ClassType.ts";
import Pool from "./Pool.ts";
import Allocator from "./Allocator.ts";

class SimplePoolAllocator<T extends object> implements Allocator<T> {

	public static readonly FACTORY_OF: <T extends object>(classType: ClassType<T>) => SimplePoolAllocator.ItemFactory<T> = <T extends object>(classType: ClassType<T>): SimplePoolAllocator.ItemFactory<T> => {
		return (): T => {
			return new classType();
		}
	};

	private static readonly DEFAULT_INITIAL_POOL_SIZE: number = 32;

	private static readonly MAX_POOL_SIZE: number = 2048;

	private readonly factory: SimplePoolAllocator.ItemFactory<T>;
	private readonly pool: Pool<T>;

	public constructor(factory: SimplePoolAllocator.ItemFactory<T>, initialPoolSize: number = SimplePoolAllocator.DEFAULT_INITIAL_POOL_SIZE) {
		if (initialPoolSize < 1) {
			throw new Error("Initial pool size must be at least 1: got " + initialPoolSize + ".");
		}
		if (initialPoolSize > SimplePoolAllocator.MAX_POOL_SIZE) {
			throw new Error("Initial pool size cannot exceed " + SimplePoolAllocator.MAX_POOL_SIZE + ": got " + initialPoolSize + ".");
		}

		this.factory = factory;
		this.pool = Pool.EMPTY(initialPoolSize);
		this.fillPool(initialPoolSize);
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
		const size: number = this.pool.getSize();

		if (size * 2 > SimplePoolAllocator.MAX_POOL_SIZE) {
			return false;
		}

		this.pool.doubleSize();
		this.fillPool(size);

		return true;
	}

}

namespace SimplePoolAllocator {

	export type ItemFactory<T extends object> = () => T;

}

export default SimplePoolAllocator;
