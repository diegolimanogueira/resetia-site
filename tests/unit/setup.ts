import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// jsdom não tem matchMedia nem IntersectionObserver; motion e os hooks do site dependem dos dois.
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

class IntersectionObserverMock implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = "";
  readonly thresholds = [];
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = () => [];
}
Object.defineProperty(window, "IntersectionObserver", { writable: true, value: IntersectionObserverMock });

afterEach(() => cleanup());
