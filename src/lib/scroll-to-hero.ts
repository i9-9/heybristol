export const HERO_SECTION_ID = 'hero';

function getScrollBehavior(preferred: ScrollBehavior = 'smooth'): ScrollBehavior {
  if (typeof window === 'undefined') return preferred;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : preferred;
}

function scrollToElement(element: HTMLElement, behavior: ScrollBehavior) {
  element.scrollIntoView({
    behavior,
    block: 'start',
    inline: 'nearest',
  });
}

function scrollToElementWithRetry(getElement: () => HTMLElement | null, behavior: ScrollBehavior) {
  const attempt = () => {
    const element = getElement();
    if (element) {
      scrollToElement(element, behavior);
      return true;
    }
    return false;
  };

  if (attempt()) return;

  let retries = 0;
  const retry = () => {
    if (attempt() || retries >= 10) return;
    retries += 1;
    setTimeout(retry, 200);
  };

  setTimeout(retry, 200);
}

export function scrollToHero(behavior: ScrollBehavior = 'smooth') {
  if (typeof document === 'undefined') return;
  scrollToElementWithRetry(
    () => document.getElementById(HERO_SECTION_ID),
    getScrollBehavior(behavior),
  );
}

export function scrollToSection(sectionId: string, behavior: ScrollBehavior = 'smooth') {
  if (typeof document === 'undefined') return;
  scrollToElementWithRetry(
    () => document.getElementById(sectionId),
    getScrollBehavior(behavior),
  );
}

export function navigateHomeAndScrollToHero(router: { push: (path: string) => void }) {
  router.push('/');
  setTimeout(() => scrollToHero(), 300);
}

export function navigateHomeAndScrollToSection(
  router: { push: (path: string) => void },
  sectionId: string,
) {
  router.push('/');
  setTimeout(() => scrollToSection(sectionId), 300);
}
