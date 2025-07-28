import js from '@eslint/js'; // JavaScript 기본 규칙들 (no-unused-vars 등)
import { defineConfig } from 'eslint/config'; // ESLint 설정 타입 안전성 제공
import prettierConfig from 'eslint-config-prettier'; // ESLint와 Prettier 규칙 충돌 방지
import prettier from 'eslint-plugin-prettier'; // Prettier 포맷팅을 ESLint 규칙으로 적용
import pluginReact from 'eslint-plugin-react'; // React/JSX 전용 규칙들 (Hook 규칙, JSX 문법 등)
import simpleImportSort from 'eslint-plugin-simple-import-sort'; // import/export 문 자동 정렬
import globals from 'globals'; // 브라우저/Node.js 전역변수 정의 (window, document 등)
import tseslint from 'typescript-eslint'; // TypeScript 코드 검사 및 타입 관련 규칙

export default defineConfig([
  // 기본 파일 타입 및 언어 설정
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'], // 검사할 파일 확장자 지정
    languageOptions: {
      globals: globals.browser, // 브라우저 환경 전역변수 사용 가능 (window, document 등)
      ecmaVersion: 12, // ES2021 문법 지원
      sourceType: 'module', // ES6 모듈 시스템 사용
      parserOptions: {
        ecmaFeatures: {
          jsx: true, // JSX 문법 파싱 활성화
        },
      },
    },
  },

  // 기본 권장 설정들
  js.configs.recommended, // JavaScript 기본 권장 규칙 (문법 오류, 일반적인 실수 방지)
  ...tseslint.configs.recommended, // TypeScript 권장 규칙 (타입 안전성, TS 모범 사례)
  pluginReact.configs.flat.recommended, // React 권장 규칙 (Hook 규칙, JSX 모범 사례)
  prettierConfig, // Prettier와 충돌하는 ESLint 규칙들 비활성화

  // 커스텀 플러그인 및 규칙 설정
  {
    plugins: {
      'simple-import-sort': simpleImportSort, // import 문 정렬 기능 활성화
      prettier, // Prettier 포맷팅 검사 기능 활성화
    },
    rules: {
      // === 코드 포맷팅 관련 ===
      'prettier/prettier': 'error', // Prettier 규칙 위반시 에러 (일관된 코드 포맷팅)

      // === Import/Export 정리 ===
      'simple-import-sort/imports': 'error', // import 문을 알파벳순으로 정렬 (가독성 향상)
      'simple-import-sort/exports': 'error', // export 문을 알파벳순으로 정렬

      // === 변수 및 코드 품질 ===
      'no-unused-vars': 'error', // 사용하지 않는 변수 금지 (불필요한 코드 제거)
      'no-console': 'warn', // console.log 사용 경고 (운영환경 배포시 제거 필요)
      'no-var': 'error', // var 사용 금지 (let/const 사용 강제)
      'prefer-const': 'error', // 재할당 없는 변수는 const 사용 강제
      'no-shadow': 'error', // 변수명 중복(섀도잉) 방지 (버그 예방)

      // === 코드 스타일 통일 ===
      eqeqeq: ['error', 'always'], // === 연산자 사용 강제 (타입 안전성)
    },
    settings: {
      react: {
        version: 'detect', // React 버전 자동 감지 (버전별 규칙 적용)
      },
    },
  },
]);
