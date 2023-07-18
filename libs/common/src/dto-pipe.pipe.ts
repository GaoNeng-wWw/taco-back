import { Injectable, PipeTransform } from '@nestjs/common';

const converter = {
	gid: BigInt,
	tid: BigInt,
};

@Injectable()
export class DtoPipe implements PipeTransform {
	transform(value: any) {
		const keys = Object.keys(value);
		for (const key of keys) {
			if (converter[key]) {
				value[key] = converter[key](value[key]);
			}
		}
		return value;
	}
}
