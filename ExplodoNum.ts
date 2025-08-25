"use strict"

export class ExplodoNumConfig {
	maxOps: number = 1e3
	serializeMode: "json" | "string" = "json"
}

const R = {}

export class Pair<T> {
	first: T
	second: T

	constructor(a: T, b: T) {
		this.first = a
		this.second = b
	}
}

export class Sign {
	internal: -1 | 1

	constructor(positive?: boolean) {
		if (positive !== undefined && positive) {
			this.internal = 1
		} else {
			this.internal = -1
		}
	}
}

export class ExplodoNum {
	sign: Sign
	array: Pair<number>[]
	layer: Pair<number>[]

	constructor() {}

	fromNumer(n: number): ExplodoNum {}
}
