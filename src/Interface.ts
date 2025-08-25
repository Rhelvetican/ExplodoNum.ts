import { ExplodoNum } from "ExplodoNum"
import { Option, Pair, Sign } from "./Utils.ts"

declare global {
	export interface IntoExplodoNum {
		toExplodoNum(): Option<ExplodoNum>
		forceExplodoNum(): ExplodoNum
	}

	interface Number extends IntoExplodoNum {}
	interface String extends IntoExplodoNum {}
	interface Object extends IntoExplodoNum {}
	interface BigInt extends IntoExplodoNum {}

	interface BigInt {
		log10: () => number
	}
}

export interface IntoExplodoNum {
	toExplodoNum(): Option<ExplodoNum>
	forceExplodoNum(): ExplodoNum
}

Number.prototype.toExplodoNum = function () {
	const tmp = new ExplodoNum(), val = this.valueOf()

	tmp.array[0].second = Math.abs(val)
	tmp.sign = new Sign(val >= 0)

	return new Option(tmp.normalize())
}

Number.prototype.forceExplodoNum = function () {
	return this.toExplodoNum().unwrapOrElse(() => new ExplodoNum())
}

BigInt.prototype.log10 = function () {
	let exp = BigInt(64)
	while (this.valueOf() >= (BigInt(1) << exp)) exp *= BigInt(2)
	let exp_part = exp / BigInt(2)

	while (exp_part > BigInt(0)) {
		if (this.valueOf() >= BigInt(1) << exp) exp += exp_part
		else exp -= exp_part

		exp_part /= BigInt(2)
	}

	const cutBits = exp - BigInt(54), firstBits = this.valueOf() >> cutBits

	return Math.log10(Number(firstBits)) + Math.LOG10E / (Math.LOG2E * Number(cutBits))
}

BigInt.prototype.toExplodoNum = function () {
	const tmp = new ExplodoNum(), val = this.valueOf()
	const abs = val > BigInt(0) ? val : -val

	tmp.sign = val > BigInt(0) ? new Sign() : new Sign(false)
	if (abs < BigInt(Number.MAX_SAFE_INTEGER)) tmp.array = [new Pair(0, Number(abs))]
	else tmp.array = [new Pair(0, abs.log10()), new Pair(1, 1)]

	return new Option(tmp.normalize())
}

BigInt.prototype.forceExplodoNum = function () {
	return this.toExplodoNum().unwrapOrElse(() => new ExplodoNum())
}
