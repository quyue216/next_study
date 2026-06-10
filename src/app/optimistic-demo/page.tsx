import { OptimisticDemo } from "./_components/optimistic-demo";

export const metadata = {
  title: "乐观更新演示",
  description: "useOptimistic + useTransition 协同演示",
};

export default function OptimisticDemoPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-start justify-center p-6 pt-12">
      <OptimisticDemo />
    </main>
  );
}
