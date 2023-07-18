import { Inject, Injectable } from '@nestjs/common';
import { MQTT_CLIENT_INSTANCE } from './constant';
import { Client, IClientOptions } from 'mqtt';

@Injectable()
export class MqttService {
	constructor(@Inject(MQTT_CLIENT_INSTANCE) public readonly client: Client) {}
	publish<T extends string | Buffer | object>(
		topic: string,
		message: T,
		opts?: IClientOptions,
	) {
		let m: string | Buffer;
		if (typeof message === 'object') {
			m = JSON.stringify(message);
		} else {
			m = message;
		}
		return new Promise((resolve, reject) => {
			this.client.publish(topic, m, opts ?? null, (err, packet) => {
				if (err) {
					reject(err);
				} else {
					resolve(packet);
				}
			});
		});
	}
}
