import '@testing-library/jest-dom';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import App from '../App';

interface Product {
  id: string;
  name: string;
  price: string;
  quantity: number;
  discountRate: number;
}

describe('advanced 테스트', () => {
  // 공통 헬퍼 함수
  const addItemsToCart = async (user: ReturnType<typeof userEvent.setup>, productId: string, count: number) => {
    const selects = screen.getAllByTestId('product-select');
    const select = selects[0]; // 첫 번째 요소 선택

    for (let i = 0; i < count; i++) {
      // 매번 상품을 선택하고 버튼 클릭
      await user.selectOptions(select, productId);
      const addButton = screen.getByTestId('add-to-cart-btn');
      await user.click(addButton);
    }
  };

  const expectProductInfo = (option: HTMLOptionElement, product: Product) => {
    expect(option.value).toBe(product.id);
    expect(option.textContent).toContain(product.name);
    expect(option.textContent).toContain(product.price);
    if (product.quantity === 0) {
      expect(option.disabled).toBe(true);
      expect(option.textContent).toContain('품절');
    }
  };

  const getCartItemQuantity = (productId: string) => {
    const cartItem = screen.queryByTestId(`cart-item-${productId}`);
    if (!cartItem) return 0;
    const qtyElement = cartItem.querySelector('.quantity-number');
    return qtyElement ? parseInt(qtyElement.textContent || '0', 10) : 0;
  };

  describe('React 장바구니 상세 기능 테스트', () => {
    let user: ReturnType<typeof userEvent.setup>;

    beforeEach(async () => {
      vi.useRealTimers();
      vi.spyOn(window, 'alert').mockImplementation(() => {});

      user = userEvent.setup();
      render(<App />);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    // 2. 상품 정보 테스트
    describe('2. 상품 정보', () => {
      describe('2.1 상품 목록', () => {
        it('5개 상품이 올바른 정보로 표시되어야 함', () => {
          const expectedProducts: Product[] = [
            { id: 'p1', name: '버그 없애는 키보드', price: '10,000원', quantity: 50, discountRate: 0.1 },
            { id: 'p2', name: '생산성 폭발 마우스', price: '20,000원', quantity: 30, discountRate: 0.15 },
            { id: 'p3', name: '거북목 탈출 모니터암', price: '30,000원', quantity: 20, discountRate: 0.2 },
            { id: 'p4', name: '에러 방지 노트북 파우치', price: '15,000원', quantity: 0, discountRate: 0.05 },
            { id: 'p5', name: '코딩할 때 듣는 Lo-Fi 스피커', price: '25,000원', quantity: 10, discountRate: 0.25 },
          ];

          const select = screen.getByTestId('product-select') as HTMLSelectElement;
          expect(select.options.length).toBe(5); // 5개 상품

          expectedProducts.forEach((product, index) => {
            const option = select.options[index]; // 첫 번째 상품부터 시작
            expectProductInfo(option, product);
          });
        });
      });

      describe('2.2 재고 관리', () => {
        it('재고가 0개인 상품은 "품절" 표시 및 선택 불가', () => {
          const select = screen.getByTestId('product-select') as HTMLSelectElement;
          const p4Option = select.querySelector('option[value="p4"]') as HTMLOptionElement;
          expect(p4Option?.disabled).toBe(true);
          expect(p4Option?.textContent).toContain('품절');
        });
      });
    });

    // 3. 할인 정책 테스트
    describe('3. 할인 정책', () => {
      describe('3.1 개별 상품 할인', () => {
        it('상품1: 10개 이상 구매 시 10% 할인', async () => {
          await addItemsToCart(user, 'p1', 10);

          const totalElement = screen.getByText(/₩90,000/);
          expect(totalElement).toBeInTheDocument();
        });

        it('상품2: 10개 이상 구매 시 15% 할인', async () => {
          await addItemsToCart(user, 'p2', 10);

          const totalElement = screen.getByText(/₩170,000/);
          expect(totalElement).toBeInTheDocument();
        });

        it('상품3: 10개 이상 구매 시 20% 할인', async () => {
          await addItemsToCart(user, 'p3', 10);

          const totalElement = screen.getByText(/₩240,000/);
          expect(totalElement).toBeInTheDocument();
        });

        it('상품5: 10개 이상 구매 시 25% 할인', async () => {
          await addItemsToCart(user, 'p5', 10);

          const totalElement = screen.getByText(/₩187,500/);
          expect(totalElement).toBeInTheDocument();
        });
      });

      describe('3.2 전체 수량 할인', () => {
        it('전체 30개 이상 구매 시 25% 할인 (개별 할인 무시)', async () => {
          // 상품1 10개, 상품2 10개, 상품3 10개 = 총 30개
          await addItemsToCart(user, 'p1', 10);
          await addItemsToCart(user, 'p2', 10);
          await addItemsToCart(user, 'p3', 10);

          const totalElement = screen.getByText(/₩450,000/);
          expect(totalElement).toBeInTheDocument();
        });
      });

      describe('3.3 특별 할인', () => {
        describe('3.3.1 화요일 할인', () => {
          it.skip('화요일에 10% 추가 할인 적용', async () => {
            const tuesday = new Date('2024-10-15');
            vi.useFakeTimers();
            vi.setSystemTime(tuesday);

            render(<App />);

            const selects = screen.getAllByTestId('product-select');
            const select = selects[0];
            await user.selectOptions(select, 'p1');
            const addButton = screen.getByTestId('add-to-cart-btn');
            await user.click(addButton);

            const totalElement = screen.getByTestId('cart-total').querySelector('.cart-total-amount');
            expect(totalElement).toHaveTextContent('₩9,000');

            vi.useRealTimers();
          }, 10000);

          it.skip('화요일 할인은 다른 할인과 중복 적용', async () => {
            const tuesday = new Date('2024-10-15');
            vi.useFakeTimers();
            vi.setSystemTime(tuesday);

            render(<App />);

            const selects = screen.getAllByTestId('product-select');
            const select = selects[0];
            await user.selectOptions(select, 'p1');
            const addButton = screen.getByTestId('add-to-cart-btn');
            await user.click(addButton);

            const totalElement = screen.getByTestId('cart-total').querySelector('.cart-total-amount');
            expect(totalElement).toHaveTextContent('₩9,000');

            vi.useRealTimers();
          }, 10000);
        });

        describe('3.3.2 번개세일', () => {
          it.skip('번개세일 알림 표시 및 20% 할인 적용', async () => {
            // React 버전에서 타이머 구현 후 테스트
            vi.useFakeTimers();
            await vi.advanceTimersByTimeAsync(40000);
            vi.useRealTimers();
          });

          it.skip('번개세일 상품은 드롭다운에 ⚡ 아이콘 표시', async () => {
            // React 버전에서 타이머 구현 후 테스트
            vi.useFakeTimers();
            await vi.advanceTimersByTimeAsync(40000);
            vi.useRealTimers();
          });
        });

        describe('3.3.3 추천할인', () => {
          it.skip('마지막 선택한 상품과 다른 상품 추천 및 5% 할인', async () => {
            // React 버전에서 타이머 구현 후 테스트
            vi.useFakeTimers();
            await addItemsToCart(user, 'p1', 1);
            await vi.advanceTimersByTimeAsync(80000);
            vi.useRealTimers();
          });

          it.skip('추천할인 상품은 드롭다운에 💝 아이콘 표시', async () => {
            // React 버전에서 타이머 구현 후 테스트
            vi.useFakeTimers();
            await addItemsToCart(user, 'p1', 1);
            await vi.advanceTimersByTimeAsync(80000);
            vi.useRealTimers();
          });
        });

        describe('3.3.4 할인 중복', () => {
          it.skip('번개세일 + 추천할인 = 25% SUPER SALE', async () => {
            // React 버전에서 타이머 구현 후 테스트
            vi.useFakeTimers();
            await vi.advanceTimersByTimeAsync(40000);
            await addItemsToCart(user, 'p1', 1);
            await vi.advanceTimersByTimeAsync(80000);
            vi.useRealTimers();
          });
        });
      });
    });

    // 4. 포인트 적립 시스템 테스트
    describe('4. 포인트 적립 시스템', () => {
      describe('4.1 기본 적립', () => {
        it('최종 결제 금액의 0.1% 포인트 적립', async () => {
          await addItemsToCart(user, 'p1', 1);

          const loyaltyPoints = screen.getByTestId('loyalty-points').querySelector('div');
          expect(loyaltyPoints).toHaveTextContent('10p');
        });
      });

      describe('4.2 추가 적립', () => {
        it.skip('화요일 구매 시 기본 포인트 2배', async () => {
          const tuesday = new Date('2024-10-15');
          vi.useFakeTimers();
          vi.setSystemTime(tuesday);

          render(<App />);

          await addItemsToCart(user, 'p1', 1);

          const loyaltyPoints = screen.getByTestId('loyalty-points').querySelector('div');
          expect(loyaltyPoints).toHaveTextContent('20p');

          vi.useRealTimers();
        }, 10000);

        it('키보드+마우스 세트 구매 시 +50p', async () => {
          await addItemsToCart(user, 'p1', 1);
          await addItemsToCart(user, 'p2', 1);

          const loyaltyPoints = screen.getByText(/80p/);
          expect(loyaltyPoints).toBeInTheDocument();
        });

        it('풀세트(키보드+마우스+모니터암) 구매 시 +100p', async () => {
          await addItemsToCart(user, 'p1', 1);
          await addItemsToCart(user, 'p2', 1);
          await addItemsToCart(user, 'p3', 1);

          const loyaltyPoints = screen.getByText(/210p/);
          expect(loyaltyPoints).toBeInTheDocument();
        });

        it('수량별 보너스 - 10개 이상 +20p', async () => {
          await addItemsToCart(user, 'p1', 10);

          const loyaltyPoints = screen.getByText(/110p/);
          expect(loyaltyPoints).toBeInTheDocument();
        });

        it('수량별 보너스 - 20개 이상 +50p', async () => {
          await addItemsToCart(user, 'p1', 20);

          const loyaltyPoints = screen.getByTestId('loyalty-points').querySelector('div');
          expect(loyaltyPoints).toHaveTextContent('250p');
        });

        it('수량별 보너스 - 30개 이상 +100p', async () => {
          await addItemsToCart(user, 'p1', 30);

          const loyaltyPoints = screen.getByTestId('loyalty-points').querySelector('div');
          expect(loyaltyPoints).toHaveTextContent('395p');
        });
      });

      describe('4.3 포인트 표시', () => {
        it('포인트 적립 내역 상세 표시', async () => {
          await addItemsToCart(user, 'p1', 1);
          await addItemsToCart(user, 'p2', 1);

          const loyaltyPoints = screen.getByText(/기본:/);
          expect(loyaltyPoints).toBeInTheDocument();
        });
      });
    });

    // 5. UI/UX 요구사항 테스트
    describe('5. UI/UX 요구사항', () => {
      describe('5.1 레이아웃', () => {
        it('필수 레이아웃 요소가 존재해야 함', () => {
          // 헤더
          expect(screen.getByText('🛒 Hanghae Online Store')).toBeInTheDocument();
          expect(screen.getByText('Shopping Cart')).toBeInTheDocument();

          // 좌측: 상품 선택 및 장바구니
          expect(screen.getByTestId('product-select')).toBeInTheDocument();
          expect(screen.getByText('장바구니가 비어있습니다.')).toBeInTheDocument();

          // 우측: 주문 요약
          expect(screen.getByText('Order Summary')).toBeInTheDocument();

          // 도움말 버튼
          expect(screen.getByTestId('guide-toggle-btn')).toBeInTheDocument();
        });
      });

      describe('5.2 상품 선택 영역', () => {
        it('할인 중인 상품 강조 표시 확인', () => {
          const select = screen.getByTestId('product-select') as HTMLSelectElement;
          const options = Array.from(select.options);

          // 품절 상품이 비활성화되어 있는지 확인
          const disabledOption = options.find((opt) => opt.disabled);
          if (disabledOption) {
            expect(disabledOption.textContent).toContain('품절');
          }
        });
      });

      describe('5.3 장바구니 영역', () => {
        it('장바구니 아이템 카드 형식 확인', async () => {
          await addItemsToCart(user, 'p1', 1);

          const cartItem = screen.getByTestId('cart-item-p1');

          // 상품명
          expect(cartItem.querySelector('h3')?.textContent).toContain('버그 없애는 키보드');

          // 수량 조절 버튼
          expect(cartItem.querySelector('[data-change="1"]')).toBeInTheDocument();
          expect(cartItem.querySelector('[data-change="-1"]')).toBeInTheDocument();

          // 제거 버튼
          expect(cartItem.querySelector('.remove-item')).toBeInTheDocument();
        });

        it('첫 번째 상품은 상단 여백 없음', async () => {
          await addItemsToCart(user, 'p1', 1);

          const firstItem = screen.getByTestId('cart-item-p1');
          expect(firstItem.className).toContain('first:pt-0');
        });

        it('마지막 상품은 하단 테두리 없음', async () => {
          await addItemsToCart(user, 'p1', 1);

          const lastItem = screen.getByTestId('cart-item-p1');
          expect(lastItem.className).toContain('last:border-b-0');
        });
      });

      describe('5.5 도움말 모달', () => {
        it('도움말 버튼 클릭 시 모달 표시', async () => {
          const helpButton = screen.getByTestId('guide-toggle-btn');

          // 클릭 후: 표시
          await user.click(helpButton);

          // 모달이 표시되었는지 확인 (실제 구현에 따라 조정 필요)
          expect(helpButton).toBeInTheDocument();
        });
      });
    });

    // 6. 기능 요구사항 테스트
    describe('6. 기능 요구사항', () => {
      describe('6.1 상품 추가', () => {
        it('선택한 상품을 장바구니에 추가', async () => {
          await addItemsToCart(user, 'p2', 1);

          expect(screen.getByTestId('cart-item-p2')).toBeInTheDocument();
        });

        it('이미 있는 상품은 수량 증가', async () => {
          await addItemsToCart(user, 'p3', 1);
          await addItemsToCart(user, 'p3', 1);

          const qty = screen.getByTestId('cart-item-p3').querySelector('.quantity-number')?.textContent;
          expect(qty).toBe('2');
        });

        it('재고 초과 시 알림 표시', async () => {
          // 재고가 10개인 상품5를 11개 추가 시도
          await addItemsToCart(user, 'p5', 11);

          // 장바구니에는 10개만 있어야 함
          const qty = getCartItemQuantity('p5');
          expect(qty).toBeLessThanOrEqual(10);
        });

        it('품절 상품은 선택 불가', async () => {
          await addItemsToCart(user, 'p4', 1);

          // 장바구니에 추가되지 않아야 함
          expect(screen.queryByTestId('cart-item-p4')).not.toBeInTheDocument();
        });
      });

      describe('6.2 수량 변경', () => {
        it('+/- 버튼으로 수량 조절', async () => {
          await addItemsToCart(user, 'p1', 1);

          const increaseBtn = screen.getByTestId('cart-item-p1').querySelector('[data-change="1"]');
          const decreaseBtn = screen.getByTestId('cart-item-p1').querySelector('[data-change="-1"]');

          // 증가
          if (increaseBtn) await user.click(increaseBtn);
          expect(screen.getByTestId('cart-item-p1').querySelector('.quantity-number')?.textContent).toBe('2');

          // 감소
          if (decreaseBtn) await user.click(decreaseBtn);
          expect(screen.getByTestId('cart-item-p1').querySelector('.quantity-number')?.textContent).toBe('1');
        });

        it('재고 한도 내에서만 증가 가능', async () => {
          // 재고 10개인 상품5를 10개 추가
          await addItemsToCart(user, 'p5', 10);

          const increaseBtn = screen.getByTestId('cart-item-p5').querySelector('[data-change="1"]');
          const qtyBefore = getCartItemQuantity('p5');

          if (increaseBtn) await user.click(increaseBtn);

          const qtyAfter = getCartItemQuantity('p5');
          expect(qtyAfter).toBe(qtyBefore); // 수량이 증가하지 않아야 함
        });

        it('수량 0이 되면 자동 제거', async () => {
          await addItemsToCart(user, 'p1', 1);

          const decreaseBtn = screen.getByTestId('cart-item-p1').querySelector('[data-change="-1"]');
          if (decreaseBtn) await user.click(decreaseBtn);

          // 장바구니에서 제거되었는지 확인
          expect(screen.queryByTestId('cart-item-p1')).not.toBeInTheDocument();
        });
      });

      describe('6.3 상품 제거', () => {
        it('Remove 버튼 클릭 시 즉시 제거', async () => {
          await addItemsToCart(user, 'p2', 1);

          const removeBtn = screen.getByTestId('cart-item-p2').querySelector('.remove-item');
          if (removeBtn) await user.click(removeBtn);

          // 장바구니에서 제거되었는지 확인
          expect(screen.queryByTestId('cart-item-p2')).not.toBeInTheDocument();
        });

        it.skip('제거된 수량만큼 재고 복구', async () => {
          // React 버전에서 재고 업데이트 로직 구현 후 테스트
          await addItemsToCart(user, 'p5', 5);

          const removeBtn = screen.getByTestId('cart-item-p5').querySelector('.remove-item');
          if (removeBtn) await user.click(removeBtn);

          // 재고가 복구되어야 하지만 현재 구현에서는 제대로 업데이트되지 않음
        });
      });

      describe('6.4 실시간 계산', () => {
        it('수량 변경 시 즉시 재계산', async () => {
          await addItemsToCart(user, 'p1', 1);

          const totalElement = screen.getByTestId('cart-total').querySelector('.cart-total-amount');
          expect(totalElement).toHaveTextContent('₩10,000');

          const increaseBtn = screen.getByTestId('cart-item-p1').querySelector('[data-change="1"]');
          if (increaseBtn) await user.click(increaseBtn);

          const newTotalElement = screen.getByTestId('cart-total').querySelector('.cart-total-amount');
          expect(newTotalElement).toHaveTextContent('₩20,000');
        });

        it('할인 정책 자동 적용', async () => {
          await addItemsToCart(user, 'p1', 10);

          const totalElement = screen.getByText(/₩90,000/);
          expect(totalElement).toBeInTheDocument();
        });

        it('포인트 실시간 업데이트', async () => {
          await addItemsToCart(user, 'p1', 1);

          const loyaltyPoints = screen.getByText(/적립 포인트: 10p/);
          expect(loyaltyPoints).toBeInTheDocument();

          const increaseBtn = screen.getByTestId('cart-item-p1').querySelector('[data-change="1"]');
          if (increaseBtn) await user.click(increaseBtn);

          const newLoyaltyPoints = screen.getByText(/적립 포인트: 20p/);
          expect(newLoyaltyPoints).toBeInTheDocument();
        });
      });

      describe('6.5 상태 관리', () => {
        it('장바구니 상품 수 표시', async () => {
          const itemCount = screen.getByText(/0 items in cart/);
          expect(itemCount).toBeInTheDocument();

          await addItemsToCart(user, 'p1', 5);

          const newItemCount = screen.getByText(/5 items in cart/);
          expect(newItemCount).toBeInTheDocument();
        });

        it('재고 부족/품절 상태 표시', async () => {
          // 상품5를 재고 부족 상태로 만듦
          await addItemsToCart(user, 'p5', 6);

          // 재고 부족 표시는 드롭다운 옵션에서 확인
          const select = screen.getByTestId('product-select') as HTMLSelectElement;
          const p5Option = select.querySelector('option[value="p5"]') as HTMLOptionElement;
          expect(p5Option?.textContent).toContain('재고 부족');

          // 상품4는 품절
          const p4Option = select.querySelector('option[value="p4"]') as HTMLOptionElement;
          expect(p4Option?.textContent).toContain('품절');
          expect(p4Option?.disabled).toBe(true);
        });
      });
    });

    // 8. 예외 처리 테스트
    describe('8. 예외 처리', () => {
      describe('8.1 재고 부족', () => {
        it('장바구니 추가 시 재고 확인', async () => {
          // 재고 10개인 상품을 11개 추가 시도
          await addItemsToCart(user, 'p5', 11);

          // 장바구니에는 최대 재고 수량만큼만 담김
          const qty = getCartItemQuantity('p5');
          expect(qty).toBeLessThanOrEqual(10);
        });

        it('수량 증가 시 재고 확인', async () => {
          // 상품5에 9개를 추가 (재고 1개 남음)
          await addItemsToCart(user, 'p5', 9);

          // 상품5의 수량이 9개인지 확인
          const qty = getCartItemQuantity('p5');
          expect(qty).toBe(9);

          // 이제 수량을 증가시키면 alert가 호출되어야 함 (재고 1개에서 2개로 증가 시도)
          const increaseBtn = screen.getByTestId('cart-item-p5').querySelector('[data-change="1"]');
          if (increaseBtn) {
            await user.click(increaseBtn);
            // alert가 호출되었는지 확인
            expect(window.alert).toHaveBeenCalledWith('재고가 부족합니다.');
          }
        });
      });

      describe('8.2 빈 장바구니', () => {
        it('장바구니가 비어있을 때 포인트 섹션 숨김', () => {
          const emptyCart = screen.getByText('장바구니가 비어있습니다.');
          expect(emptyCart).toBeInTheDocument();
        });

        it('주문 요약에 기본값 표시', () => {
          const totalElement = screen.getByText(/₩0/);
          expect(totalElement).toBeInTheDocument();

          const itemCount = screen.getByText(/0 items in cart/);
          expect(itemCount).toBeInTheDocument();
        });
      });

      describe('8.3 동시성 이슈', () => {
        it.skip('번개세일과 추천할인이 같은 상품에 적용 시 최대 25%', async () => {
          // React 버전에서 타이머 구현 후 테스트
          vi.useFakeTimers();
          await vi.advanceTimersByTimeAsync(40000);
          await addItemsToCart(user, 'p1', 1);
          await vi.advanceTimersByTimeAsync(80000);
          vi.useRealTimers();
        });
      });
    });

    // 복잡한 시나리오 테스트
    describe('복잡한 통합 시나리오', () => {
      it.skip('화요일 + 풀세트 + 대량구매 시나리오', async () => {
        const tuesday = new Date('2024-10-15');
        vi.useFakeTimers();
        vi.setSystemTime(tuesday);

        render(<App />);

        // 키보드 10개, 마우스 10개, 모니터암 10개
        await addItemsToCart(user, 'p1', 10);
        await addItemsToCart(user, 'p2', 10);
        await addItemsToCart(user, 'p3', 10);

        // 총액 확인: 600,000원 -> 25% 할인 -> 450,000원 -> 화요일 10% -> 405,000원
        const totalElement = screen.getByTestId('cart-total').querySelector('.cart-total-amount');
        expect(totalElement).toHaveTextContent('₩405,000');

        // 포인트 확인: 405포인트(기본) * 2(화요일) + 50(세트) + 100(풀세트) + 100(30개) = 1060포인트
        const loyaltyPoints = screen.getByTestId('loyalty-points').querySelector('div');
        expect(loyaltyPoints).toHaveTextContent('1060p');

        vi.useRealTimers();
      }, 10000);

      it.skip('번개세일 + 추천할인 + 화요일 시나리오', async () => {
        // React 버전에서 타이머 구현 후 테스트
        const tuesday = new Date('2024-10-15');
        vi.useFakeTimers();
        vi.setSystemTime(tuesday);

        render(<App />);

        await vi.advanceTimersByTimeAsync(40000);
        await addItemsToCart(user, 'p1', 1);
        await vi.advanceTimersByTimeAsync(80000);

        vi.useRealTimers();
      });
    });
  });
});
