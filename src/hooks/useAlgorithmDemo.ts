import { useState, useCallback, useRef, useEffect } from 'react';
import { DemoConfig, DemoState, DemoActions } from '../types/demo';

/**
 * 算法演示自定义 Hook
 * 封装演示状态管理逻辑，与UI解耦
 * 支持自动播放、手动控制、错误降级
 */
export function useAlgorithmDemo(
  config: DemoConfig | null,
  autoPlayInterval: number = 2000
): DemoState & DemoActions {
  const [state, setState] = useState<DemoState>({
    currentStep: 0,
    isPlaying: false,
    isComplete: false,
    currentSnapshot: config?.snapshots[0] || null,
    error: null,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 当 config 变化时重置状态
  useEffect(() => {
    if (config) {
      setState({
        currentStep: 0,
        isPlaying: false,
        isComplete: false,
        currentSnapshot: config.snapshots[0] || null,
        error: null,
      });
    }
    // 清理定时器
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [config]);

  // 自动播放逻辑
  useEffect(() => {
    if (state.isPlaying && config) {
      intervalRef.current = setInterval(() => {
        setState((prev) => {
          const nextStep = prev.currentStep + 1;
          if (nextStep >= config.snapshots.length) {
            // 播放完成
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            return {
              ...prev,
              isPlaying: false,
              isComplete: true,
            };
          }
          return {
            ...prev,
            currentStep: nextStep,
            currentSnapshot: config.snapshots[nextStep],
          };
        });
      }, autoPlayInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [state.isPlaying, config, autoPlayInterval]);

  const next = useCallback(() => {
    if (!config) return;
    setState((prev) => {
      const nextStep = prev.currentStep + 1;
      if (nextStep >= config.snapshots.length) {
        return { ...prev, isComplete: true, isPlaying: false };
      }
      return {
        ...prev,
        currentStep: nextStep,
        currentSnapshot: config.snapshots[nextStep],
        isPlaying: false,
      };
    });
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [config]);

  const prev = useCallback(() => {
    if (!config) return;
    setState((prev) => {
      const prevStep = Math.max(0, prev.currentStep - 1);
      return {
        ...prev,
        currentStep: prevStep,
        currentSnapshot: config.snapshots[prevStep],
        isComplete: false,
        isPlaying: false,
      };
    });
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [config]);

  const reset = useCallback(() => {
    if (!config) return;
    setState({
      currentStep: 0,
      isPlaying: false,
      isComplete: false,
      currentSnapshot: config.snapshots[0],
      error: null,
    });
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [config]);

  const play = useCallback(() => {
    if (!config) return;
    if (state.isComplete) {
      // 如果已完成，从头开始
      setState({
        currentStep: 0,
        isPlaying: true,
        isComplete: false,
        currentSnapshot: config.snapshots[0],
        error: null,
      });
    } else {
      setState((prev) => ({ ...prev, isPlaying: true }));
    }
  }, [config, state.isComplete]);

  const pause = useCallback(() => {
    setState((prev) => ({ ...prev, isPlaying: false }));
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const goToStep = useCallback(
    (step: number) => {
      if (!config) return;
      const clampedStep = Math.max(0, Math.min(step, config.snapshots.length - 1));
      setState({
        currentStep: clampedStep,
        isPlaying: false,
        isComplete: clampedStep === config.snapshots.length - 1,
        currentSnapshot: config.snapshots[clampedStep],
        error: null,
      });
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    },
    [config]
  );

  return {
    ...state,
    next,
    prev,
    reset,
    play,
    pause,
    goToStep,
  };
}
