// 
// DataGrid.ts
//

import Area from "../geometry/Area.ts";
import MathHelper from "../MathHelper.ts";
import DiscreteField from "./DiscreteField.ts";
import DataAccessor from "./DataAccessor.ts";

export default class DataGrid<T> extends DiscreteField implements DataAccessor<DiscreteField.Point, T> {

	private readonly data: T[];

	public constructor(area: Area, fillValue: T) {
		super(area);
		this.data = new Array<T>(area.getValue());
		this.fill(fillValue);
	}

	public override getPoint(x: number, y: number): DiscreteField.Point {
		({ x, y } = this.limit(x, y));
		return super.getPoint(x, y);
	}

	public setAt(point: DiscreteField.Point, value: T): void {
		if (point.getField() != this) {
			throw new Error("Point is not referenced to this field.");
		}

		const index: number = this.getIndex(point);
		this.data[index] = value;
	}

	public getAt(point: DiscreteField.Point): T {
		if (point.getField() != this) {
			throw new Error("Point is not referenced to this field.");
		}

		const index: number = this.getIndex(point);
		return this.data[index];
	}

	public fill(value: T): void {
		this.data.fill(value);
	}

	public copyFrom(dataGrid: DataGrid<T>): void {
		if (this.equals(dataGrid) == false) {
			throw new Error("Cannot copy source into destination: grid sizes do not match.");
		}

		for (let i: number = 0; i < this.data.length; i++) {
			this.data[i] = dataGrid.data[i];
		}
	}

	private limit(x: number, y: number): { x: number, y: number } {
		const x0: number = MathHelper.mod(x, this.getWidth());
		const y0: number = MathHelper.clamp(y, this.getLowerYValue(), this.getUpperYValue());

		return {
			x: x0,
			y: y0
		};
	}

	private getIndex(point: DiscreteField.Point): number {
		return point.getY() * this.area.getWidth() + point.getX();
	}

}
