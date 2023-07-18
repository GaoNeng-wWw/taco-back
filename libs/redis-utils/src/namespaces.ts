export const useNameSpace = (base: string, ...args) =>
	`${base}:${args.join(':')}`;
