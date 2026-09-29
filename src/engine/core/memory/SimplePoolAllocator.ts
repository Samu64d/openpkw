//
// SimplePoolAllocator.ts
//

import Nullable from "../common/Nullable.ts";
import Supplier from "../common/Supplier.ts";
import ClassType from "../reflection/class/ClassType.ts";
import Pool from "./Pool.ts";
import PoolAllocator from "./PoolAllocator.ts";

export default class SimplePoolAllocator<T extends object> extends PoolAllocator<T> {

	public static readonly DEFAULT_MIN_POOL_CAPACITY: number = 32;

	public static readonly DEFAULT_MAX_POOL_CAPACITY: number = 2048;

	public static createItemFactory<T extends object>(classType: ClassType.NoAbstract<T>): Supplier<T> {
		return (): T => {
			return new classType();
		};
	}

	private readonly itemFactory: Supplier<T>;
	private readonly pool: Pool<T>;

	public constructor(itemFactory: Supplier<T>, minPoolCapacity: number = SimplePoolAllocator.DEFAULT_MIN_POOL_CAPACITY, maxPoolCapacity: number = SimplePoolAllocator.DEFAULT_MAX_POOL_CAPACITY) {
		super(minPoolCapacity, maxPoolCapacity);

		this.itemFactory = itemFactory;
		this.pool = Pool.EMPTY(minPoolCapacity);
		this.fillPoolUpToCapacity();
	}

	public getItemFactory(): Supplier<T> {
		return this.itemFactory;
	}

	public override malloc(): Nullable<T> {
		while (true) {
			const item: Nullable<T> = this.tryAcquireItemFromPool(this.pool);

			if (item != null) {
				return item;
			}

			if (this.tryIncreasePoolCapacity(this.pool) == false) {
				return null;
			}

			this.fillPoolUpToCapacity();
		}
	}

	public override free(item: T): void {
		this.pool.releaseItem(item);
	}

	private createItem(): T {
		return this.itemFactory();
	}

	private fillPoolUpToCapacity(): void {
		const itemCount: number = this.pool.getRemainingCapacity();

		for (let i: number = 0; i < itemCount; i++) {
			const item: T = this.createItem();

			this.pool.addItem(item);
		}
	}

}
