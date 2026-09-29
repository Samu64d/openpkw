//
// SpanPoolAllocator.ts
//

import Nullable from "../common/Nullable.ts";
import Function from "../common/Function.ts";
import MathHelper from "../math/MathHelper.ts";
import ClassType from "../reflection/class/ClassType.ts";
import Pool from "./Pool.ts";
import PoolAllocator from "./PoolAllocator.ts";

class SpanPoolAllocator<T extends object> extends PoolAllocator<T> {

	public static readonly DEFAULT_MIN_POOL_CAPACITY: number = 32;

	public static readonly DEFAULT_MAX_POOL_CAPACITY: number = 4096;

	public static createItemFactory<T extends object>(classType: ClassType.NoAbstract<T>): Function<number, T> {
		return (itemSize: number): T => {
			return new classType(itemSize);
		};
	}

	private static readonly POOL_COUNT: number = 16;

	private static readonly MAX_MALLOC_SIZE: number = 1 << (SpanPoolAllocator.POOL_COUNT - 1);

	private readonly itemFactory: Function<number, T>;
	private readonly poolRegistry: Map<SpanPoolAllocator.PoolId, Pool<T>>;
	private readonly globalItemRegistry: Map<T, SpanPoolAllocator.PoolId>;

	public constructor(itemFactory: Function<number, T>, minPoolCapacity: number = SpanPoolAllocator.DEFAULT_MIN_POOL_CAPACITY, maxPoolCapacity = SpanPoolAllocator.DEFAULT_MAX_POOL_CAPACITY) {
		super(minPoolCapacity, maxPoolCapacity);

		this.itemFactory = itemFactory;
		this.poolRegistry = new Map<SpanPoolAllocator.PoolId, Pool<T>>();
		this.globalItemRegistry = new Map<T, SpanPoolAllocator.PoolId>();
		this.initializeAndFillPools(minPoolCapacity);
	}

	public getItemFactory(): Function<number, T> {
		return this.itemFactory;
	}

	public override malloc(size: number): Nullable<T> {
		if (size < 1) {
			throw new Error("Malloc size must be at least 1: got " + size + ".");
		}
		if (size > SpanPoolAllocator.MAX_MALLOC_SIZE) {
			throw new Error("Maximum malloc item size allowed is " + SpanPoolAllocator.MAX_MALLOC_SIZE + ": got " + size + ".");
		}

		const poolId: SpanPoolAllocator.PoolId = MathHelper.findNextPowerOfTwo(size);

		while (true) {
			if (this.poolRegistry.has(poolId) == false) {
				throw new Error("Invalid pool id: got " + poolId + ".");
			}

			const pool: Pool<T> = this.poolRegistry.get(poolId) as Pool<T>;
			const item: Nullable<T> = this.tryAcquireItemFromPool(pool);

			if (item != null) {
				return item;
			}

			if (this.tryIncreasePoolCapacity(pool) == false) {
				return null;
			}

			this.fillPoolUpToCapacity(poolId);
		}
	}

	public override free(item: T): void {
		if (this.globalItemRegistry.has(item) == false) {
			throw new Error("Invalid item reference.");
		}

		const poolId: SpanPoolAllocator.PoolId = this.globalItemRegistry.get(item) as SpanPoolAllocator.PoolId;
		const pool: Pool<T> = this.poolRegistry.get(poolId) as Pool<T>;

		pool.releaseItem(item);
	}

	private createItem(itemSize: number): T {
		return this.itemFactory(itemSize);
	}

	private fillPoolUpToCapacity(poolId: SpanPoolAllocator.PoolId): void {
		const pool: Pool<T> = this.poolRegistry.get(poolId) as Pool<T>;
		const itemCount: number = pool.getRemainingCapacity();
		const itemSize: number = poolId;

		for (let i: number = 0; i < itemCount; i++) {
			const item: T = this.createItem(itemSize);

			pool.addItem(item);
			this.globalItemRegistry.set(item, poolId);
		}
	}

	private initializeAndFillPools(initialPoolCapacity: number): void {
		for (let i: number = 0; i < SpanPoolAllocator.POOL_COUNT; i++) {
			const poolId: number = 1 << i;
			const pool: Pool<T> = Pool.EMPTY(initialPoolCapacity);

			this.poolRegistry.set(poolId, pool);
			this.fillPoolUpToCapacity(poolId);
		}
	}

}

namespace SpanPoolAllocator {

	export type PoolId = number;

}

export default SpanPoolAllocator;
