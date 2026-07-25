//
// MetaDataAccessor.ts
//

import "reflect-metadata";

import Nullable from "../../foundation/Nullable.ts";

class MetaDataAccessor<T extends object> {

	private readonly target: T;

	public constructor(target: T) {
		this.target = target;
	}

	public getTarget(): T {
		return this.target;
	}

	public has(metaDataName: MetaDataAccessor.MetaDataName): boolean {
		return Reflect.hasMetadata(metaDataName, this.target);
	}

	public set<V>(metaDataName: MetaDataAccessor.MetaDataName, metadataValue: V): void {
		Reflect.defineMetadata(metaDataName, metadataValue, this.target);
	}

	public get<V>(metaDataName: MetaDataAccessor.MetaDataName): Nullable<V> {
		return Reflect.getMetadata(metaDataName, this.target) ?? null;
	}

	public delete(metaDataName: MetaDataAccessor.MetaDataName): boolean {
		return Reflect.deleteMetadata(metaDataName, this.target);
	}

	public hasProperty(metaDataName: MetaDataAccessor.MetaDataName, propertyName: MetaDataAccessor.PropertyName): boolean {
		return Reflect.hasMetadata(metaDataName, this.target, propertyName);
	}

	public setProperty<V>(metaDataName: MetaDataAccessor.MetaDataName, propertyName: MetaDataAccessor.PropertyName, metadataValue: V): void {
		Reflect.defineMetadata(metaDataName, metadataValue, this.target, propertyName);
	}

	public getProperty<V>(metaDataName: MetaDataAccessor.MetaDataName, propertyName: MetaDataAccessor.PropertyName): Nullable<V> {
		return Reflect.getMetadata(metaDataName, this.target, propertyName) ?? null;
	}

	public deleteProperty(metaDataName: MetaDataAccessor.MetaDataName, propertyName: MetaDataAccessor.PropertyName): boolean {
		return Reflect.deleteMetadata(metaDataName, this.target, propertyName);
	}

}

namespace MetaDataAccessor {

	export type PropertyName = string | symbol;

	export type MetaDataName = string | symbol;

}

export default MetaDataAccessor;
