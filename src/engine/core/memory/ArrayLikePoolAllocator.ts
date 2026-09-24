//
// ArrayLikePoolAllocator.ts
//

import Nullable from "../common/Nullable.ts";
import MathHelper from "../math/MathHelper.ts";
import Allocator from "./Allocator.ts";

class ArrayLikePoolAllocator<T extends ArrayLike<unknown>> implements Allocator<T> {

	private static readonly BUCKET_COUNT: number = 16;

	private static readonly INITIAL_BUCKET_ITEM_COUNT: number = 32;

	private static readonly MAX_BUCKET_ITEM_COUNT: number = 4096;

	private readonly itemType: ArrayConstructor;
	private readonly maxMallocSize: number;
	private readonly bucketIdFreeItemListMap: Map<number, T[]>;
	private readonly bucketIdFreeItemCountMap: Map<number, number>;
	private readonly itemFreeMarkMap: Map<T, boolean>;

	public constructor(itemType: ArrayLikePoolAllocator.ArrayLikeConstructor<T>) {
		this.itemType = itemType;
		this.maxMallocSize = 1 << (ArrayLikePoolAllocator.BUCKET_COUNT - 1);
		this.bucketIdFreeItemListMap = new Map<number, T[]>();
		this.bucketIdFreeItemCountMap = new Map<number, number>();
		this.itemFreeMarkMap = new Map<T, boolean>();
		this.initializeBuckets();
	}

	public malloc(size: number): Nullable<T> {
		if (size < 1) {
			throw new Error("Malloc size must be at least 1: got " + size + ".");
		}
		if (size > this.maxMallocSize) {
			throw new Error("Max malloc item size allowed is " + this.maxMallocSize + ": got " + size + ".");
		}

		const bucketId: number = MathHelper.findNextPowerOfTwo(size);

		while (true) {
			const item: Nullable<T> = this.tryPickFromBucket(bucketId);

			if (item != null) {
				this.itemFreeMarkMap.set(item, false);
				return item;
			}

			if (this.tryGrowBucket(bucketId) == false) {
				return null;
			}
		}
	}

	public free(item: T): void {
		if (this.itemFreeMarkMap.has(item) == false) {
			throw new Error("Invalid item reference.");
		}
		if (this.itemFreeMarkMap.get(item) == true) {
			throw new Error("Item was already free.");
		}

		const bucketId: number = MathHelper.findNextPowerOfTwo(item.length);
		this.putInBucket(bucketId, item);
		this.itemFreeMarkMap.set(item, true);
	}

	private allocateItem(size: number): T {
		return new this.itemType(size);
	}

	private initializeBuckets(): void {
		const bucketCount: number = ArrayLikePoolAllocator.BUCKET_COUNT;
		const bucketItemCount: number = ArrayLikePoolAllocator.INITIAL_BUCKET_ITEM_COUNT;

		for (let i: number = 0; i < bucketCount; i++) {
			const bucketId: number = 1 << i;
			const itemList: T[] = new Array<T>(bucketItemCount);

			for (let j: number = 0; j < bucketItemCount; j++) {
				const item: T = this.allocateItem(bucketId);

				itemList[j] = item;
				this.itemFreeMarkMap.set(item, true);
			}

			this.bucketIdFreeItemListMap.set(bucketId, itemList);
			this.bucketIdFreeItemCountMap.set(bucketId, bucketItemCount);
		}
	}

	private tryGetBucketFreeItemList(bucketId: number): T[] {
		if (this.bucketIdFreeItemListMap.has(bucketId) == false) {
			throw new Error("Cannot retrive bucket item list with id: " + bucketId + ".");
		}

		return this.bucketIdFreeItemListMap.get(bucketId) as T[];
	}

	private tryPickFromBucket(bucketId: number): Nullable<T> {
		const itemList: T[] = this.tryGetBucketFreeItemList(bucketId);

		if (itemList.length > 0) {
			return itemList.pop() as T;
		}

		return null;
	}

	private putInBucket(bucketId: number, item: T): void {
		const itemList: T[] = this.tryGetBucketFreeItemList(bucketId);
		itemList.push(item);
	}

	private tryGrowBucket(bucketId: number): boolean {
		const itemList: T[] = this.tryGetBucketFreeItemList(bucketId);
		const oldSize: number = this.bucketIdFreeItemCountMap.get(bucketId) as number;
		const newSize: number = oldSize * 2 - itemList.length;

		if (oldSize * 2 > ArrayLikePoolAllocator.MAX_BUCKET_ITEM_COUNT) {
			return false;
		}

		for (let i: number = oldSize; i < newSize; i++) {
			const item: T = this.allocateItem(bucketId);
			itemList.push(item);
			this.itemFreeMarkMap.set(item, true);
		}

		this.bucketIdFreeItemCountMap.set(bucketId, oldSize * 2)
		return true;
	}

}

namespace ArrayLikePoolAllocator {

	export type ArrayLikeConstructor<T extends ArrayLike<unknown>> = new (length: number) => T;

}

export default ArrayLikePoolAllocator;
