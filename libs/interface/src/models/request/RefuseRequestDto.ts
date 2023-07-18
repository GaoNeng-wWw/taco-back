/**
 * RefuseRequestDto
 */
export interface RefuseRequestDto {
	/**
	 * 是否不在允许相同的发送者向你发出请求
	 */
	reject_same_sender: number;
	rid: string;
}
