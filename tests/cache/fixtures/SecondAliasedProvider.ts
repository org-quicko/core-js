import { Cache } from "../../../index";

export class AliasedProvider {
	private calls = 0;

	@Cache()
	async load(identifier: string) {
		this.calls += 1;
		return `second:${identifier}:${this.calls}`;
	}
}
