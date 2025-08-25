"use strict"

import { Pair, Sign } from "./Utils.ts"
import { IntoExplodoNum } from "./Interface.ts"

const R = {
	ZERO: 0,
	ONE: 1,
	E: Math.E,
	LN2: Math.LN2,
	LN10: Math.LN10,
	LOG2E: Math.LOG2E,
	LOG10E: Math.LOG10E,
	PI: Math.PI,
	SQRT1_2: Math.SQRT1_2,
	SQRT2: Math.SQRT2,
	MAX_SAFE_INTEGER: Number.MAX_SAFE_INTEGER,
	MIN_SAFE_INTEGER: Number.MIN_SAFE_INTEGER,
	NaN: Number.NaN,
	NEGATIVE_INFINITY: Number.NEGATIVE_INFINITY,
	POSITIVE_INFINITY: Number.POSITIVE_INFINITY,
	E_MAX_SAFE_INTEGER: "e" + Number.MAX_SAFE_INTEGER,
	EE_MAX_SAFE_INTEGER: "ee" + Number.MAX_SAFE_INTEGER,
	TETRATED_MAX_SAFE_INTEGER: "10^^" + Number.MAX_SAFE_INTEGER,
}

export class ExplodoNumConfig {
	readonly maxOps: number
	readonly serializeMode: "string" | "json"

	constructor(maxOps: number, serializeMode: "string" | "json") {
		this.maxOps = maxOps
		this.serializeMode = serializeMode
	}
}

export class ExplodoNum {
	static config: ExplodoNumConfig = new ExplodoNumConfig(1e3, "json")

	sign: Sign
	array: Array<Pair<number>>
	layer: {
		base: number
		layer: Array<Pair<number>>
	}

	constructor(
		sign?: Sign,
		array?: Array<Pair<number>>,
		layer?: { base: number; layer: Array<Pair<number>> },
	) {
		this.sign = sign ? sign : new Sign()
		this.array = array ? array : [new Pair(0, NaN)]
		this.layer = layer ? layer : { base: 0, layer: [] }
	}

	normalize() {
		let b = false
		const x = this.clone()

		if (!x.array.length) x.array = [new Pair(0, 0)]
		if (x.layer.base > R.MAX_SAFE_INTEGER) {
			x.array = [new Pair(0, Infinity)]
			x.layer.base = 0
		}

		if (!Number.isInteger(x.layer.base)) x.layer.base = Math.floor(x.layer.base)

		for (let i = 0; i < x.array.length; ++i) {
			let e = x.array[i]

			if (!e.first) {
				e.first = 0
			}

			if (e.first !== 0 && (!e.second)) {
				x.array.splice(i, 1)
				--i
				continue
			}

			if (isNaN(e.first) || isNaN(e.second)) {
				x.array = [new Pair(0, NaN)]
				return x
			}

			if (!(isFinite(e.first) && isFinite(e.second))) {
				x.array = [new Pair(0, Infinity)]
				return x
			}

			if (!Number.isInteger(e.first)) e.first = Math.floor(e.first)
			if (e.first !== 0 && !Number.isInteger(e.second)) e.second = Math.floor(e.second)
		}

		for (let i = 0; i < x.layer.layer.length; ++i) {
			const e = x.layer.layer[i]
			if (!e.first) {
				e.first = 0
			}
			if (e.first !== 0 && (!e.second)) {
				x.layer.layer.splice(i, 1)
				--i
				continue
			}

			if (isNaN(e.first) || isNaN(e.second)) {
				x.layer.layer = [new Pair(0, NaN)]
				return x
			}

			if (!(isFinite(e.first) && isFinite(e.second))) {
				x.layer.layer = [new Pair(0, Infinity)]
				return x
			}

			if (!Number.isInteger(e.first)) e.first = Math.floor(e.first)
			if (e.first !== 0 && !Number.isInteger(e.second)) e.second = Math.floor(e.second)
		}

		do {
			b = false

			x.array.sort((a, b) => a.first > b.first ? 1 : a.first < b.first ? -1 : 0)
			x.layer.layer.sort((a, b) => a.first > b.first ? 1 : a.first < b.first ? -1 : 0)

			if (x.array.length > ExplodoNum.config.maxOps) x.array.splice(0, x.array.length - ExplodoNum.config.maxOps)
			if (x.layer.layer.length > ExplodoNum.config.maxOps) x.layer.layer.splice(0, x.layer.layer.length - ExplodoNum.config.maxOps)

			if (!x.array.length) x.array = [new Pair(0, 0)]

			if (x.array[x.array.length - 1].first > R.MAX_SAFE_INTEGER) {
				if (this.layer.layer[0].first) {
					this.layer.layer[0].second++
				} else {
					this.layer.layer.splice(0, 0, new Pair(0, 1))
				}

				x.array = [new Pair(0, x.array[x.array.length - 1].first)]
				b = true
			} else if (x.getOperator(true, 0) && x.array.length == 1 && x.array[0].first === 0) {
				if (x.layer.layer[0].second == 1) x.layer.layer.splice(0, 1)
				else x.array = [new Pair(0, 10), new Pair(Math.round(x.array[0].second), 1)]
				b = true
			}

			if (x.array.length < ExplodoNum.config.maxOps && x.array[0].first !== 0) x.array.unshift(new Pair(0, 10))

			for (let i = 0; i < x.array.length - 1; ++i) {
				if (x.array[i].first == x.array[i + 1].first) {
					x.array[i].second += x.array[i + 1].second
					x.array.splice(i + 1, 1)
					--i
					b = true
				}
			}

			for (let i = 0; i < x.layer.layer.length - 1; ++i) {
				if (x.layer.layer[i].first == x.layer.layer[i + 1].first) {
					x.layer.layer[i].second += x.layer.layer[i + 1].second
					x.layer.layer.splice(i + 1, 1)
					--i
					b = true
				}
			}

			while (x.array.length >= 2 && x.array[0].first === 0 && x.array[0].second == 1 && x.array[1].second) {
				if (x.array[1].second > 1) x.array[1].second--
				else x.array.splice(1, 1)

				x.array[0].second = 10
			}

			if (x.layer.layer.length >= 1 && x.array.length == 1 && x.array[0].first === 0 && x.array[0].second == 1 && x.layer.layer[0].second) {
				if (x.layer.layer[0].second > 1) x.layer.layer[0].second--
				else x.layer.layer.splice(0, 1)

				x.array[0].second = 10
			}

			if (x.array.length >= 2 && x.array[0].first === 0 && x.array[1].first != 1) {
				if (x.array[0].second) x.array.splice(1, 0, new Pair(x.array[1].first, x.array[0].second))
				x.array[0].second = 1

				if (x.array[2].second > 1) x.array[2].second--
				else x.array.splice(2, 1)

				b = true
			}

			if (x.layer.layer.length >= 1 && x.array.length == 1 && x.array[0].first === 0 && x.layer.layer[0].first != 0) {
				if (x.array[0].second) x.layer.layer.splice(0, 0, new Pair(x.layer.layer[0].first - 1, x.array[0].second))
				x.array[0].second = 1

				if (x.layer.layer[1].second > 1) x.layer.layer[1].second--
				else x.layer.layer.splice(1, 1)

				b = true
			}

			for (let i = 1; i < x.array.length; ++i) {
				if (x.array[i].second > R.MAX_SAFE_INTEGER) {
					if (i != x.array.length - 1 && x.array[i + 1].first == x.array[i].first + 1) x.array[i + 1].second++
					else x.array.splice(i + 1, 0, new Pair(x.array[i].first, 1))

					if (x.array[0].first === 0) x.array[0].second = x.array[i].second + 1
					else x.array.splice(0, 0, new Pair(0, x.array[i].second + 1))
					x.array.splice(1, i)
					b = true
				}
			}

			for (let i = 1; i < x.layer.layer.length; ++i) {
				if (x.layer.layer[i].second > R.MAX_SAFE_INTEGER) {
					if (i != x.layer.layer.length - 1 && x.layer.layer[i + 1].first == x.layer.layer[i].first + 1) x.layer.layer[i + 1].second++
					else x.layer.layer.splice(i + 1, 0, new Pair(x.layer.layer[i].first + 1, 1))

					x.array = [new Pair(0, x.array[i].second + 1)]
					x.layer.layer.splice(1, i)
					b = true
				}
			}
		} while (b)

		if (!x.array.length) x.array = [new Pair(0, 0)]

		return x
	}

	abs() {
		const tmp = this.clone()
		tmp.sign = new Sign()

		return tmp
	}

	neg() {
		const tmp = this.clone()
		tmp.sign = this.sign.flipClone()

		return tmp
	}

	cmp<T extends IntoExplodoNum>(o: T) {
		const other = o.forceExplodoNum()
	}

	getOperatorIndex(isLayer: boolean, i: number) {
		if (!isFinite(i)) throw new Error("Index out of range.")
		const a = isLayer ? this.layer.layer : this.array
		let min = 0, max = a.length - 1
		if (a[max].first < i) return max + 0.5
		if (a[min].first > i) return -0.5

		while (min !== max) {
			if (a[min].first == i) return min
			if (a[max].second == i) return max

			const mid = Math.floor((min + max) / 2)
			if (min === mid || a[mid].first === i) {
				min = mid
				break
			}

			if (a[mid].first < i) min = mid
			if (a[mid].first > i) max = mid
		}

		return a[min].first == i ? min : min + 0.5
	}

	getOperator(isLayer: boolean, oper: number) {
		const idx = this.getOperatorIndex(isLayer, oper)

		if (Number.isInteger(idx)) {
			if (isLayer) return this.layer.layer[idx].second
			else return this.array[idx].second
		}

		return isLayer ? 0 : (oper === 0 ? 10 : 0)
	}

	clone() {
		return new ExplodoNum(this.sign, structuredClone(this.array), structuredClone(this.layer))
	}

	static fromNumber(n: number) {
		return n.forceExplodoNum()
	}
}
