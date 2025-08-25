export class Pair<T> {
	first: T
	second: T

	constructor(first: T, second: T) {
		this.first = first
		this.second = second
	}
}

export type DefaultFunction<A, T> = (args: A) => T

export class Sign {
	internal: 1 | -1 = 1

	constructor(positive?: boolean) {
		if (positive === false) {
			this.internal = -1
		} else {
			this.internal = 1
		}
	}

	flip() {
		this.internal *= -1
	}

	clone() {
		return new Sign(this.internal > 0)
	}

	flipClone() {
		return new Sign(this.internal < 0)
	}
}

export class Option<T> {
	data: T | null

	constructor(data?: T | null) {
		this.data = data ? data : null
	}

	isNone() {
		return this.data === null
	}

	isSome() {
		return this.data !== null
	}

	isSomeAnd(precondition: (arg: T) => boolean) {
		return this.data !== null && precondition(this.data)
	}

	isNoneOr(precondition: (arg: T) => boolean) {
		return this.data === null || precondition(this.data)
	}

	map<U>(fn: (arg: T) => U): Option<U> {
		if (this.data === null) {
			return new Option()
		} else {
			return new Option(fn(this.data))
		}
	}

	unwrap(): T {
		if (this.data === null) {
			throw new Error("Unwrapping a null Option.")
		}

		return this.data
	}

	unwrapOr(defaultValue: T): T {
		try {
			return this.unwrap()
		} catch (_) {
			return defaultValue
		}
	}

	unwrapOrElse(fn: () => T) {
		try {
			return this.unwrap()
		} catch (_) {
			return fn()
		}
	}
}
