// 🏪 이벤트 시스템 - WeakMap, Set, Map 활용
export const eventSystem = {
  // WeakMap: 이벤트 엘리먼트 관리 (메모리 누수 방지)
  eventElements: new WeakMap(),

  // Set: 이벤트 타입 관리 (중복 방지)
  eventTypes: new Set(['click', 'change', 'input', 'submit', 'keydown', 'keyup', 'focus', 'blur']),

  // 이벤트 타입 동적 등록
  registerEventType: (eventType) => {
    eventSystem.eventTypes.add(eventType);
  },

  // 이벤트 타입 동적 제거
  unregisterEventType: (eventType) => {
    eventSystem.eventTypes.delete(eventType);
  },

  // 이벤트 타입 존재 여부 확인
  hasEventType: (eventType) => {
    return eventSystem.eventTypes.has(eventType);
  },

  // 등록된 모든 이벤트 타입 조회
  getRegisteredEventTypes: () => {
    return Array.from(eventSystem.eventTypes);
  },

  // Map: 이벤트 핸들러 관리 (타입별 핸들러 그룹화)
  eventHandlers: new Map(),

  // 이벤트 위임을 위한 부모 요소 탐색
  findEventTarget: (event, selector) => {
    let target = event.target;
    while (target && target !== event.currentTarget) {
      if (target.matches(selector)) {
        return target;
      }
      target = target.parentElement;
    }
    // currentTarget도 확인 (매뉴얼 오버레이 같은 경우)
    if (event.currentTarget.matches(selector)) {
      return event.currentTarget;
    }
    return null;
  },

  // 이벤트 핸들러 등록
  registerHandler: (eventType, selector, handler) => {
    // 이벤트 타입이 등록되지 않은 경우 자동 등록
    if (!eventSystem.hasEventType(eventType)) {
      eventSystem.registerEventType(eventType);
    }

    if (!eventSystem.eventHandlers.has(eventType)) {
      eventSystem.eventHandlers.set(eventType, new Map());
    }
    eventSystem.eventHandlers.get(eventType).set(selector, handler);
  },

  // 이벤트 위임 핸들러 생성
  createDelegatedHandler: (eventType) => {
    return (event) => {
      const handlers = eventSystem.eventHandlers.get(eventType);
      if (!handlers) return;

      for (const [selector, handler] of handlers) {
        const target = eventSystem.findEventTarget(event, selector);
        if (target) {
          handler(event, target);
          break;
        }
      }
    };
  },

  // 이벤트 리스너 등록
  attachEventListeners: (container) => {
    eventSystem.eventElements.set(container, new Set());

    for (const eventType of eventSystem.eventTypes) {
      const delegatedHandler = eventSystem.createDelegatedHandler(eventType);
      container.addEventListener(eventType, delegatedHandler);
      eventSystem.eventElements.get(container).add(eventType);
    }
  },

  // 특정 이벤트 타입 리스너 동적 등록
  attachEventListener: (container, eventType) => {
    if (!eventSystem.hasEventType(eventType)) {
      eventSystem.registerEventType(eventType);
    }

    const attachedEvents = eventSystem.eventElements.get(container);
    if (attachedEvents && !attachedEvents.has(eventType)) {
      const delegatedHandler = eventSystem.createDelegatedHandler(eventType);
      container.addEventListener(eventType, delegatedHandler);
      attachedEvents.add(eventType);
    }
  },

  // 특정 이벤트 타입 리스너 동적 제거
  detachEventListener: (container, eventType) => {
    const attachedEvents = eventSystem.eventElements.get(container);
    if (attachedEvents && attachedEvents.has(eventType)) {
      const delegatedHandler = eventSystem.createDelegatedHandler(eventType);
      container.removeEventListener(eventType, delegatedHandler);
      attachedEvents.delete(eventType);
    }
  },

  // 이벤트 리스너 제거
  detachEventListeners: (container) => {
    const attachedEvents = eventSystem.eventElements.get(container);
    if (attachedEvents) {
      for (const eventType of attachedEvents) {
        const delegatedHandler = eventSystem.createDelegatedHandler(eventType);
        container.removeEventListener(eventType, delegatedHandler);
      }
      eventSystem.eventElements.delete(container);
    }
  },

  // 모든 이벤트 핸들러 제거
  clearHandlers: () => {
    eventSystem.eventHandlers.clear();
  },

  // 특정 이벤트 타입의 모든 핸들러 제거
  clearHandlersForEventType: (eventType) => {
    eventSystem.eventHandlers.delete(eventType);
  },

  // 특정 선택자의 핸들러 제거
  removeHandler: (eventType, selector) => {
    const handlers = eventSystem.eventHandlers.get(eventType);
    if (handlers) {
      handlers.delete(selector);
      // 핸들러가 없으면 이벤트 타입도 제거
      if (handlers.size === 0) {
        eventSystem.eventHandlers.delete(eventType);
      }
    }
  },

  // 이벤트 시스템 상태 조회
  getEventSystemStatus: () => {
    return {
      registeredEventTypes: eventSystem.getRegisteredEventTypes(),
      totalHandlers: Array.from(eventSystem.eventHandlers.entries()).map(([eventType, handlers]) => ({
        eventType,
        handlerCount: handlers.size,
      })),
    };
  },
};
