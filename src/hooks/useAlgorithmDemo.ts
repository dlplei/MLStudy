import { useState, useCallback, useRef, useEffect } from 'react';
import { DemoConfig, DemoState, DemoActions, DemoSnapshot } from '../types/demo';
import { demoService } from '../services/DemoService';
import { logger } from '../services/Logger';

/**
 * 算法演示自定义 Hook (Phase 2)
 * 
 * 通过 DemoService 异步获取数据，集成 LRU 缓存和日志。
 * 支持优雅降级：如果数据加载失败，自动回退到静态模式。
 */
export function useAlgorithmDemo(
  algorithmId: string | null,
  autoPlayInterval: number = 2500
): DemoState & DemoActions & { config: DemoConfig | null } {
  const [state, setState] = useState<DemoState>({
    currentStep: 0,
    isPlaying: false,
    isComplete: false,
    isLoading: false,
    currentSnapshot: null,
    error: null,
    isDegraded: false,
  });

  const [config, setConfig] = useState<DemoConfig | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 当 algorithmId 变化时，通过 DemoService 加载数据
  useEffect(() => {
    if (!algorithmId) {
      setConfig(null);
      setState({
        currentStep: 0,
        isPlaying: false,
        isComplete: false,
        isLoading: false,
        currentSnapshot: null,
        error: null,
        isDegraded: false,
      });
      return;
    }

    let cancelled = false;

    const loadDemo = async () => {
      setState((prev) => ({ ...prev, isLoading: true, error: null, isDegraded: false }));

      try {
        const response = await demoService.fetchDemoConfig(algorithmId);

        if (cancelled) return;

        if (response.status === 'success' && response.data) {
          const loadedConfig = response.data;
          setConfig(loadedConfig);
          setState({
            currentStep: 0,
            isPlaying: false,
            isComplete: false,
            isLoading: false,
            currentSnapshot: loadedConfig.snapshots[0] || null,
            error: null,
            isDegraded: false,
          });

          logger.info('DEMO_HOOK', `Demo loaded successfully`, {
            algorithmId,
            steps: loadedConfig.totalSteps,
            cached: response.cached,
            responseTimeMs: response.responseTimeMs,
          });
        } else {
          // 降级处理
          logger.warn('DEMO_HOOK', `Demo unavailable, degrading`, {
            algorithmId,
            error: response.error,
          });

          setState({
            currentStep: 0,
            isPlaying: false,
            isComplete: false,
            isLoading: false,
            currentSnapshot: null,
            error: response.error || 'Demo data unavailable',
            isDegraded: true,
          });
        }
      } catch (err) {
        if (cancelled) return;

        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        logger.error('DEMO_HOOK', `Load failed`, { algorithmId, error: errorMsg });

        setState({
          currentStep: 0,
          isPlaying: false,
          isComplete: false,
          isLoading: false,
          currentSnapshot: null,
          error: errorMsg,
          isDegraded: true,
        });
      }
    };

    loadDemo();

    return () => {
      cancelled = true;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [algorithmId]);

  // 自动播放逻辑
  useEffect(() => {
    if (state.isPlaying && config) {
      intervalRef.current = setInterval(() => {
        setState((prev) => {
          if (!config) return prev;
          const nextStep = prev.currentStep + 1;
          if (nextStep >= config.snapshots.length) {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            return { ...prev, isPlaying: false, isComplete: true };
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
      isLoading: false,
      currentSnapshot: config.snapshots[0],
      error: null,
      isDegraded: false,
    });
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [config]);

  const play = useCallback(() => {
    if (!config) return;
    if (state.isComplete) {
      setState({
        currentStep: 0,
        isPlaying: true,
        isComplete: false,
        isLoading: false,
        currentSnapshot: config.snapshots[0],
        error: null,
        isDegraded: false,
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
        isLoading: false,
        currentSnapshot: config.snapshots[clampedStep],
        error: null,
        isDegraded: false,
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
    config,
    next,
    prev,
    reset,
    play,
    pause,
    goToStep,
  };
}
