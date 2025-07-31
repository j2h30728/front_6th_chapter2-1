/**
 * 숫자 포맷팅 (천 단위 콤마)
 * @param {number} number - 포맷팅할 숫자
 * @returns {string} 포맷팅된 문자열
 */
export const formatNumber = (number) => Math.round(number).toLocaleString();

/**
 * 가격 포맷팅 (₩ + 천 단위 콤마)
 * @param {number} price - 포맷팅할 가격
 * @returns {string} 포맷팅된 가격 문자열
 */
export const formatPrice = (price) => `₩${formatNumber(price)}`;

/**
 * 안전한 숫자 변환
 * @param {string|number} value - 변환할 값
 * @param {number} defaultValue - 기본값
 * @returns {number} 변환된 숫자 또는 기본값
 */
export const safeParseInt = (value, defaultValue = 0) => {
  const parsed = parseInt(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

/**
 * 조건부 실행
 * @param {boolean} condition - 실행 조건
 * @param {Function} action - 실행할 함수
 */
export const when = (condition, action) => {
  if (condition) action();
};

/**
 * 조건부 값 반환
 * @param {boolean} condition - 조건
 * @param {*} trueValue - 조건이 true일 때 반환할 값
 * @param {*} falseValue - 조건이 false일 때 반환할 값
 * @returns {*} 조건에 따른 값
 */
export const whenValue = (condition, trueValue, falseValue) => (condition ? trueValue : falseValue);
