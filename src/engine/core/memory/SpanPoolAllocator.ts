//
// SpanPoolAllocator.ts
//

import Nullable from "../common/Nullable.ts";
import MathHelper from "../math/MathHelper.ts";
import ClassType from "../reflection/class/ClassType.ts";
import Pool from "./Pool.ts";
import Allocator from "./Allocator.ts";

class SpanPoolAllocator<T extends object> implements Allocator<T> {

	public static readonly FACTORY_OF: <T extends object>(classType: ClassType.NoAbstract<T>) => SpanPoolAllocator.ItemFactory<T> = <T extends object>(classType: ClassType.NoAbstract<T>): SpanPoolAllocator.ItemFactory<T> => {
		return (itemSize: number): T => {
			return new classType(itemSize);
		}
	};

	private static readonly DEFAULT_INITIAL_POOL_CAPACITY: number = 32;

	private static readonly MAX_POOL_CAPACITY: number = 4096;

	private static readonly POOL_COUNT: number = 16;

	private static readonly MAX_MALLOC_SIZE: number = 1 << (SpanPoolAllocator.POOL_COUNT - 1);

	private readonly factory: SpanPoolAllocator.ItemFactory<T>;
	private readonly poolRegistry: Map<SpanPoolAllocator.PoolId, Pool<T>>;
	private readonly globalItemRegistry: Map<T, SpanPoolAllocator.PoolId>;

	public constructor(factory: SpanPoolAllocator.ItemFactory<T>, initialPoolCapacity: number = SpanPoolAllocator.DEFAULT_INITIAL_POOL_CAPACITY) {
		if (initialPoolCapacity < 1) {
			throw new Error("Initial pool capacity must be at least 1: got " + initialPoolCapacity + ".");
		}
		if (initialPoolCapacity > SpanPoolAllocator.MAX_POOL_CAPACITY) {
			throw new Error("Initial pool capacity cannot exceed " + SpanPoolAllocator.MAX_POOL_CAPACITY + ": got " + initialPoolCapacity + ".");
		}

		this.factory = factory;
		this.poolRegistry = new Map<SpanPoolAllocator.PoolId, Pool<T>>();
		this.globalItemRegistry = new Map<T, SpanPoolAllocator.PoolId>();
		this.initializePools(initialPoolCapacity);
	}

	public malloc(size: number): Nullable<T> {
		if (size < 1) {
			throw new Error("Malloc size must be at least 1: got " + size + ".");
		}
		if (size > SpanPoolAllocator.MAX_MALLOC_SIZE) {
			throw new Error("Max malloc item size allowed is " + SpanPoolAllocator.MAX_MALLOC_SIZE + ": got " + size + ".");
		}

		const poolId: SpanPoolAllocator.PoolId = MathHelper.findNextPowerOfTwo(size);

		while (true) {
			if (this.poolRegistry.has(poolId) == false) {
				throw new Error("Invalid pool id: got " + poolId + ".");
			}

			const item: Nullable<T> = this.tryAcquireFromPool(poolId);

			if (item != null) {
				return item;
			}

			if (this.tryGrowPool(poolId) == false) {
				return null;
			}
		}
	}

	public free(item: T): void {
		if (this.globalItemRegistry.has(item) == false) {
			throw new Error("Invalid item reference.");
		}

		const poolId: SpanPoolAllocator.PoolId = this.globalItemRegistry.get(item) as SpanPoolAllocator.PoolId;
		const pool: Pool<T> = this.poolRegistry.get(poolId) as Pool<T>;

		pool.releaseItem(item);
	}

	private allocateItem(itemSize: number): T {
		return this.factory(itemSize);
	}

	private fillPool(poolId: SpanPoolAllocator.PoolId, itemCount: number): void {
		const pool: Pool<T> = this.poolRegistry.get(poolId) as Pool<T>;
		const itemSize: number = poolId;

		for (let i: number = 0; i < itemCount; i++) {
			const item: T = this.allocateItem(itemSize);
			pool.registerItem(item);
			this.globalItemRegistry.set(item, poolId);
		}
	}

	private initializePools(initialPoolCapacity: number): void {
		for (let i: number = 0; i < SpanPoolAllocator.POOL_COUNT; i++) {
			const poolId: number = 1 << i;
			const pool: Pool<T> = Pool.EMPTY(initialPoolCapacity);

			this.poolRegistry.set(poolId, pool);
			this.fillPool(poolId, initialPoolCapacity);
		}
	}

	private tryAcquireFromPool(poolId: SpanPoolAllocator.PoolId): Nullable<T> {
		const pool: Pool<T> = this.poolRegistry.get(poolId) as Pool<T>;

		if (pool.isEmpty() == true) {
			return null;
		}

		return pool.acquireItem() as T;
	}

	private tryGrowPool(poolId: SpanPoolAllocator.PoolId): boolean {
		const pool: Pool<T> = this.poolRegistry.get(poolId) as Pool<T>;
		const capacity: number = pool.getCapacity();

		if (capacity * 2 > SpanPoolAllocator.MAX_POOL_CAPACITY) {
			return false;
		}

		pool.doubleCapacity();
		this.fillPool(poolId, capacity);

		return true;
	}

}

namespace SpanPoolAllocator {

	export type PoolId = number;

	export type ItemFactory<T extends object> = (itemSize: number) => T;

}

export default SpanPoolAllocator;
