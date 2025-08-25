import { ExplodoNum } from "ExplodoNum"
import { Option, Sign } from "./Utils.ts"

declare global {
	export interface IntoExplodoNum {
		toExplodoNum(): Option<ExplodoNum>
	}

	interface Number extends IntoExplodoNum {}
	interface String extends IntoExplodoNum {}
	interface Object extends IntoExplodoNum {}
}

export interface IntoExplodoNum {
	toExplodoNum(): Option<ExplodoNum>
}

Number.prototype.toExplodoNum = function () {
	const tmp = new ExplodoNum(), val = this.valueOf()

	tmp.array[0].second = Math.abs(val)
	tmp.sign = new Sign(val >= 0)

	return new Option(tmp.normalize())
}
