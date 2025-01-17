export function debounce(
  func: (value: string) => Promise<void> | void,
  wait: number,
): (value: string) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(value: string) {
    const later = () => {
      timeout = null;
      func(value);
    };

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(later, wait);
  };
}
