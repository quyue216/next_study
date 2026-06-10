'use client';

import { useOptimistic, useTransition, useState, useEffect } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  AlertTriangle,
  CheckCircle2,
  Wifi,
  Zap,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// 1. 模拟 Server Action，支持控制是否失败
async function toggleLikeAction(shouldFail: boolean) {
  await new Promise((resolve) => setTimeout(resolve, 1500)); // 1.5 秒网络延迟
  if (shouldFail) {
    throw new Error('数据库连接超时');
  }
  return true;
}

type Mode = 'optimistic' | 'traditional';
type Status = 'idle' | 'success' | 'error';

export function OptimisticDemo() {
  const [dbLikes, setDbLikes] = useState(42);
  const [dbIsLiked, setDbIsLiked] = useState(false);
  const [simulateError, setSimulateError] = useState(false);
  const [mode, setMode] = useState<Mode>('optimistic');
  const [status, setStatus] = useState<Status>('idle');

  const [isPending, startTransition] = useTransition();

  // 2. 配置 useOptimistic
  const [optimisticState, setOptimisticState] = useOptimistic(
    { count: dbLikes, liked: dbIsLiked },
    (state, nextLiked: boolean) => ({
      count: nextLiked ? state.count + 1 : state.count - 1,
      liked: nextLiked,
    })
  );

  // 成功/错误后自动重置状态
  useEffect(() => {
    if (status === 'success' || status === 'error') {
      const timer = setTimeout(() => setStatus('idle'), 2500);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const displayCount = mode === 'optimistic' ? optimisticState.count : dbLikes;
  const displayLiked = mode === 'optimistic' ? optimisticState.liked : dbIsLiked;

  const handleLike = () => {
    const nextLikedState =
      mode === 'optimistic' ? !optimisticState.liked : !dbIsLiked;

    setStatus('idle');

    startTransition(async () => {
      if (mode === 'optimistic') {
        // 触发瞬时界面更新
        setOptimisticState(nextLikedState);
      }

      try {
        await toggleLikeAction(simulateError);
        // 成功后，提交到真实数据库状态
        setDbLikes((prev) => (nextLikedState ? prev + 1 : prev - 1));
        setDbIsLiked(nextLikedState);
        setStatus('success');
      } catch (err) {
        // 出错时，React 会自动将 optimisticState 回滚到数据库状态
        setStatus('error');
      }
    });
  };

  const statusConfig = {
    idle: {
      color: 'bg-slate-400',
      text: 'text-foreground',
      label: '空闲',
      icon: null as null,
    },
    success: {
      color: 'bg-emerald-400',
      text: 'text-emerald-500',
      label: '服务器同步成功',
      icon: CheckCircle2,
    },
    error: {
      color: 'bg-red-400',
      text: 'text-red-500',
      label: '已触发回滚',
      icon: AlertTriangle,
    },
  };

  const currentConfig = statusConfig[status];
  const StatusIcon = currentConfig.icon;

  return (
    <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Social Card */}
      <div className="lg:col-span-7">
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          {/* Card Header */}
          <div className="p-5 flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              张三
            </div>
            <div>
              <div className="font-semibold text-foreground">张三</div>
              <div className="text-xs text-muted-foreground">
                @zhangsan · 2小时前
              </div>
            </div>
          </div>

          {/* Card Body */}
          <div className="px-5 pb-4">
            <p className="text-foreground leading-relaxed">
              刚上线了一个使用 React 19 的{' '}
              <span className="font-mono text-sm bg-muted px-1.5 py-0.5 rounded text-foreground/80">
                useOptimistic
              </span>{' '}
              和{' '}
              <span className="font-mono text-sm bg-muted px-1.5 py-0.5 rounded text-foreground/80">
                useTransition
              </span>{' '}
              的新功能！即使网络有延迟，交互体验也能做到瞬时响应。试试切换两种模式，感受其中的差异。
            </p>
            <div className="mt-4 aspect-[16/9] bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-xl flex items-center justify-center border border-border/50">
              <div className="text-center space-y-2">
                <Zap className="w-8 h-8 text-indigo-400 mx-auto" />
                <span className="text-xs text-muted-foreground font-medium">
                  乐观更新演示
                </span>
              </div>
            </div>
          </div>

          {/* Card Footer */}
          <div className="px-5 py-4 border-t border-border flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button
                onClick={handleLike}
                className="group flex items-center gap-2 transition-colors select-none"
              >
                <div className="relative">
                  <Heart
                    className={cn(
                      'w-5 h-5 transition-all duration-200',
                      displayLiked
                        ? 'fill-red-500 text-red-500 scale-110'
                        : 'text-muted-foreground group-hover:text-foreground',
                      'active:scale-75'
                    )}
                  />
                  {isPending && mode === 'traditional' && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="w-5 h-5 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
                    </span>
                  )}
                  {isPending && mode === 'optimistic' && (
                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                    </span>
                  )}
                </div>
                <span
                  className={cn(
                    'text-sm font-medium tabular-nums',
                    displayLiked
                      ? 'text-red-500'
                      : 'text-muted-foreground'
                  )}
                >
                  {displayCount}
                </span>
              </button>

              <button className="group flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors select-none">
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm font-medium tabular-nums">12</span>
              </button>

              <button className="group flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors select-none">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="lg:col-span-5 space-y-4">
        {/* Status Card */}
        <div className="bg-card border border-border rounded-2xl shadow-sm p-5 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">
                实时状态面板
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                实时状态流转
              </p>
            </div>
            <div
              className={cn(
                'w-3 h-3 rounded-full transition-colors duration-300',
                isPending ? 'bg-blue-400 animate-pulse' : currentConfig.color
              )}
            />
          </div>

          {/* Status Badge */}
          <div
            className={cn(
              'rounded-lg px-4 py-3 flex items-center gap-3 transition-colors duration-300',
              status === 'error'
                ? 'bg-red-500/10'
                : status === 'success'
                  ? 'bg-emerald-500/10'
                  : isPending
                    ? 'bg-blue-500/10'
                    : 'bg-muted'
            )}
          >
            {StatusIcon && (
              <StatusIcon
                className={cn('w-5 h-5 shrink-0', currentConfig.text)}
              />
            )}
            {!StatusIcon && isPending && (
              <Wifi className="w-5 h-5 shrink-0 text-blue-500 animate-pulse" />
            )}
            {!StatusIcon && !isPending && (
              <Clock className="w-5 h-5 shrink-0 text-muted-foreground" />
            )}
            <div>
              <div
                className={cn(
                  'text-sm font-mono font-medium',
                  isPending ? 'text-blue-500' : currentConfig.text
                )}
              >
                {isPending
                  ? mode === 'optimistic'
                    ? '[乐观更新生效中]'
                    : '[服务器同步中...]'
                  : `[${currentConfig.label}]`}
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                {isPending
                  ? mode === 'optimistic'
                    ? '界面已瞬时更新，等待服务器确认...'
                    : '界面已冻结，等待服务器响应...'
                  : status === 'success'
                    ? '服务器已确认状态变更。'
                    : status === 'error'
                      ? 'React 已自动回滚到之前的状态。'
                      : '服务器状态稳定。'}
              </div>
            </div>
          </div>

          {/* Mode Toggle */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              更新策略
            </div>
            <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-lg">
              <button
                onClick={() => setMode('optimistic')}
                className={cn(
                  'flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all',
                  mode === 'optimistic'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Zap className="w-4 h-4" />
                乐观更新
              </button>
              <button
                onClick={() => setMode('traditional')}
                className={cn(
                  'flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all',
                  mode === 'traditional'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Clock className="w-4 h-4" />
                传统加载
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {mode === 'optimistic'
                ? '界面瞬时更新。若服务器请求失败，React 会自动回滚到之前的状态。'
                : '界面等待服务器响应。按钮在 1.5 秒请求期间显示加载动画。'}
            </p>
          </div>

          {/* Error Toggle */}
          <div className="pt-2 border-t border-border space-y-3">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              网络环境
            </div>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-foreground">
                模拟网络错误
              </span>
              <button
                onClick={() => setSimulateError((prev) => !prev)}
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  simulateError
                    ? 'bg-red-500'
                    : 'bg-slate-200 dark:bg-slate-700'
                )}
              >
                <span
                  className={cn(
                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                    simulateError ? 'translate-x-6' : 'translate-x-1'
                  )}
                />
              </button>
            </label>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              开启后，服务器动作将在 1.5 秒后抛出异常。在乐观更新模式下，React 会自动回滚界面状态。
            </p>
          </div>
        </div>

        {/* Raw State Panel */}
        <div className="bg-card border border-border rounded-2xl shadow-sm p-5 space-y-3">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            状态检查器
          </div>
          <div className="space-y-2 font-mono text-xs">
            {(
              [
                { label: '数据库点赞数', value: dbLikes, highlight: false },
                {
                  label: '数据库是否点赞',
                  value: dbIsLiked.toString(),
                  highlight: false,
                },
                {
                  label: '乐观点赞数',
                  value: optimisticState.count,
                  highlight: optimisticState.count !== dbLikes,
                },
                {
                  label: '乐观是否点赞',
                  value: optimisticState.liked.toString(),
                  highlight: optimisticState.liked !== dbIsLiked,
                },
                {
                  label: '同步中',
                  value: isPending.toString(),
                  highlight: isPending,
                },
                { label: '模式', value: mode === 'optimistic' ? '乐观更新' : '传统加载', highlight: false },
              ] as const
            ).map((item) => (
              <div
                key={item.label}
                className="flex justify-between items-center"
              >
                <span className="text-muted-foreground">{item.label}:</span>
                <span
                  className={cn(
                    'px-1.5 py-0.5 rounded',
                    item.highlight
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold'
                      : 'text-foreground'
                  )}
                >
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
