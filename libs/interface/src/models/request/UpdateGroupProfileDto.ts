// tslint:disable
/**
 * next-taco
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 1.0.0
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { GroupMember } from '../../';

/**
 * @export
 * @interface UpdateGroupProfileDto
 */
export interface UpdateGroupProfileDto {
	/**
	 * @type {string}
	 * @memberof UpdateGroupProfileDto
	 */
	name: string;
	/**
	 * @type {Array<GroupMember>}
	 * @memberof UpdateGroupProfileDto
	 */
	members: Array<GroupMember>;
	/**
	 * @type {string}
	 * @memberof UpdateGroupProfileDto
	 */
	description: string;
	/**
	 * @type {Array<string>}
	 * @memberof UpdateGroupProfileDto
	 */
	notices: Array<string>;
	/**
	 * @type {Array<string>}
	 * @memberof UpdateGroupProfileDto
	 */
	banner: Array<string>;
}
