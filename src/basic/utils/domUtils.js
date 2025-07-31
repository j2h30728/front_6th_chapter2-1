// 🎯 DOM 조작 유틸리티 함수들

/**
 * DOM 요소를 ID로 가져오기
 * @param {string} id - 요소 ID
 * @returns {HTMLElement|null} DOM 요소 또는 null
 */
export const getElement = (id) => document.getElementById(id);

/**
 * DOM 요소를 안전하게 가져오기 (옵셔널 체이닝)
 * @param {string} id - 요소 ID
 * @returns {HTMLElement|null} DOM 요소 또는 null
 */
export const getElementSafely = (id) => document.getElementById(id) || null;

/**
 * 쿼리 셀렉터로 요소 가져오기
 * @param {HTMLElement} parent - 부모 요소
 * @param {string} selector - CSS 셀렉터
 * @returns {HTMLElement|null} 찾은 요소 또는 null
 */
export const querySelector = (parent, selector) => parent?.querySelector(selector);

/**
 * 텍스트 콘텐츠 설정하기
 * @param {string} elementId - 요소 ID
 * @param {string} text - 설정할 텍스트
 */
export const setTextContent = (elementId, text) => {
  const element = getElement(elementId);
  if (element) element.textContent = text;
};

/**
 * HTML 콘텐츠 설정하기
 * @param {string} elementId - 요소 ID
 * @param {string} html - 설정할 HTML
 */
export const setInnerHTML = (elementId, html) => {
  const element = getElement(elementId);
  if (element) element.innerHTML = html;
};

/**
 * 클래스 토글하기
 * @param {string} elementId - 요소 ID
 * @param {string} className - 클래스명
 * @param {boolean} condition - 조건 (true면 제거, false면 추가)
 */
export const toggleClass = (elementId, className, condition) => {
  const element = getElement(elementId);
  if (element) {
    if (condition) {
      element.classList.remove(className);
    } else {
      element.classList.add(className);
    }
  }
};

/**
 * 스타일 설정하기
 * @param {string} elementId - 요소 ID
 * @param {string} property - CSS 속성명
 * @param {string} value - 설정할 값
 */
export const setStyle = (elementId, property, value) => {
  const element = getElement(elementId);
  if (element) element.style[property] = value;
};
