import { useEffect, useMemo, useRef } from "react";
import styled from "@emotion/styled";
import { debounce, throttle } from "lodash";

export const GridContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`;

type GridZStackProps = {
  level: number;
};

export const GridZStack = styled("div")<GridZStackProps>`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: ${({ level }) => (level ? level + 99 : 0)};
`;

export function getMinMax(
  array: number[],
  minThreshold?: number
): [number, number] {
  let min = array[0],
    max = array[0];
  for (let i = 1; i < array.length; i++) {
    let value = array[i];
    if (minThreshold !== undefined && value < minThreshold) {
      continue;
    }
    min = value < min ? value : min;
    max = value > max ? value : max;
  }
  return [min, max];
}

export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef<() => void>();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current?.();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => {
        clearInterval(id);
      };
    }
  }, [delay]);
}

export function useThrottle(callback: () => void, wait: number) {
  const savedCallback = useRef<() => void>();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  const throttleCallback = useMemo(() => {
    const func = () => {
      savedCallback.current?.();
    };
    return throttle(func, wait);
  }, [wait]);

  return throttleCallback;
}

export function useDebounce(callback: () => void, wait: number) {
  const savedCallback = useRef<() => void>();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  const debounceCallback = useMemo(() => {
    const func = () => {
      savedCallback.current?.();
    };
    return debounce(func, wait, { leading: true, trailing: false });
  }, [wait]);

  return debounceCallback;
}

export function useAnimationFrame(callback: (deltaTime: number) => void, wait: number) {
  const savedCallback = useRef<(deltaTime: number) => void>();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    let previousTime = 0;
    const animate = (time: number) => {
      if (previousTime) {
        const deltaTime = time - previousTime;
        savedCallback.current?.(deltaTime);
      }
      previousTime = time;
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, []);
}

export function binarySearch<T, S>(
  arr: T[],
  el: S,
  compare_fn: (a: S, b: T) => number
): number {
  let m = 0;
  let n = arr.length - 1;
  while (m <= n) {
    let k = (n + m) >> 1;
    let cmp = compare_fn(el, arr[k]);
    if (cmp > 0) {
      m = k + 1;
    } else if (cmp < 0) {
      n = k - 1;
    } else {
      return k;
    }
  }
  return m;
}
