import "./slider.ts"
export function pow(basis: number, degree: number) {
	if (degree === 0)
		return 1;

	let result = basis;
	for (let i = 1; i < degree; i++) {
		result*=basis;
	}

	return result;
}
