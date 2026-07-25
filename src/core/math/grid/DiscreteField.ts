// 
// DiscreteField.ts
//

import Area from "../geometry/Area.ts";

class DiscreteField {

	protected readonly area: Area;
	protected readonly lowerXLowerYCorner: DiscreteField.Point;
	protected readonly upperXLowerYCorner: DiscreteField.Point;
	protected readonly lowerXUpperYCorner: DiscreteField.Point;
	protected readonly upperXUpperYCorner: DiscreteField.Point;

	public constructor(area: Area) {
		this.area = area;
		this.lowerXLowerYCorner = this.getPoint(this.getLowerXValue(), this.getLowerYValue());
		this.upperXLowerYCorner = this.getPoint(this.getUpperXValue(), this.getLowerYValue());
		this.lowerXUpperYCorner = this.getPoint(this.getLowerXValue(), this.getUpperYValue());
		this.upperXUpperYCorner = this.getPoint(this.getUpperXValue(), this.getUpperYValue());
	}

	public getWidth(): number {
		return this.area.getWidth();
	}

	public getHeight(): number {
		return this.area.getHeight();
	}

	public getArea(): number {
		return this.area.getValue();
	}

	public getLowerXValue(): number {
		return 0;
	}

	public getUpperXValue(): number {
		return this.area.getWidth() - 1;
	}

	public getLowerYValue(): number {
		return 0;
	}

	public getUpperYValue(): number {
		return this.area.getHeight() - 1;
	}

	public getLowerXLowerYCorner(): DiscreteField.Point {
		return this.lowerXLowerYCorner;
	}

	public getUpperXLowerYCorner(): DiscreteField.Point {
		return this.upperXLowerYCorner;
	}

	public getLowerXUpperYCorner(): DiscreteField.Point {
		return this.lowerXUpperYCorner;
	}

	public getUpperXUpperYCorner(): DiscreteField.Point {
		return this.upperXUpperYCorner;
	}

	public getPoint(x: number, y: number): DiscreteField.Point {
		return new DiscreteField.Point(this, x, y);
	}

	public getPointWith(point: DiscreteField.Point): DiscreteField.Point {
		return this.getPoint(point.getX(), point.getY());
	}

	public visit(callback: (point: DiscreteField.Point) => void): void {
		for (let x: number = this.getLowerXValue(); x <= this.getUpperXValue(); x++) {
			for (let y: number = this.getLowerYValue(); y <= this.getUpperYValue(); y++) {
				const point: DiscreteField.Point = this.getPoint(x, y);
				callback(point);
			}
		}
	}

	public equals(discreteField: DiscreteField): boolean {
		return this.area.equals(discreteField.area);
	}

}

namespace DiscreteField {

	export class Point {

		private readonly field: DiscreteField;
		private readonly x: number;
		private readonly y: number;

		public constructor(field: DiscreteField, x: number, y: number) {
			if (x < field.getLowerXValue() || x > field.getUpperXValue() || y < field.getLowerYValue() || y > field.getUpperYValue()) {
				throw new Error("Point is not inside field.");
			}

			this.field = field;
			this.x = x;
			this.y = y;
		}

		public getField(): DiscreteField {
			return this.field;
		}

		public getX(): number {
			return this.x;
		}

		public getY(): number {
			return this.y;
		}

		public set(x: number, y: number): DiscreteField.Point {
			return this.field.getPoint(x, y);
		}

		public setX(x: number): DiscreteField.Point {
			return this.set(x, this.y);
		}

		public setY(y: number): DiscreteField.Point {
			return this.set(this.x, y);
		}

		public offset(dx: number, dy: number): DiscreteField.Point {
			return this.set(this.x + dx, this.y + dy);
		}

		public offsetX(dx: number): DiscreteField.Point {
			return this.offset(dx, 0);
		}

		public offsetY(dy: number): DiscreteField.Point {
			return this.offset(0, dy);
		}

		public up(): DiscreteField.Point {
			return this.offset(0, 1);
		}

		public upRight(): DiscreteField.Point {
			return this.offset(1, 1);
		}

		public right(): DiscreteField.Point {
			return this.offset(1, 0);
		}

		public downRight(): DiscreteField.Point {
			return this.offset(1, -1);
		}

		public down(): DiscreteField.Point {
			return this.offset(0, -1);
		}

		public downLeft(): DiscreteField.Point {
			return this.offset(-1, -1);
		}

		public left(): DiscreteField.Point {
			return this.offset(-1, 0);
		}

		public upLeft(): DiscreteField.Point {
			return this.offset(-1, 1);
		}

	}

}

export default DiscreteField;
