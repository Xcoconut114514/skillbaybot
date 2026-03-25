'use client';

import { useState, useEffect } from 'react';
import { Spinner } from '@heroui/spinner';
import { TaskCard } from '@/components/attention/TaskCard';
import { VerificationModal } from '@/components/attention/VerificationModal';
import { SuccessAnimation } from '@/components/attention/SuccessAnimation';
import { getTasks } from '@/lib/api/attention';
import type { Task } from '@/types/attention';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  
  // 模拟用户ID，实际应从认证系统获取
  const userId = 'user-123';

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTask = (task: Task) => {
    // 打开币安直播
    window.open(task.streamUrl, '_blank');
    // 显示验证码输入模态框
    setSelectedTask(task);
  };

  const handleVerificationSuccess = (points: number) => {
    setEarnedPoints(points);
    setShowSuccess(true);
    loadTasks(); // 刷新任务列表
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      {/* 左侧边栏 */}
      <aside className="hidden lg:block w-64 flex-shrink-0">
        <div className="sticky top-20 space-y-4">
          {/* 积分卡片 */}
          <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">💎</span>
              <span className="text-sm text-default-500">我的积分</span>
            </div>
            <div className="text-3xl font-bold text-green-500">
              1250 PTS
            </div>
            <div className="text-xs text-default-400 mt-1">
              ≈ $12.50 USDT
            </div>
          </div>

          {/* 快捷链接 */}
          <div className="space-y-2">
            <div className="text-xs text-default-500 px-2 mb-2">支持的平台</div>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-default-100 transition-colors text-left">
              <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <span className="text-sm">Y</span>
              </div>
              <span className="text-sm">YiTie</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-default-100 transition-colors text-left">
              <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <span className="text-sm">B</span>
              </div>
              <span className="text-sm">BinanceLabs</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-default-100 transition-colors text-left">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                <span className="text-sm">C</span>
              </div>
              <span className="text-sm">CZ_Binance</span>
            </button>
          </div>
        </div>
      </aside>

      {/* 主内容区 */}
      <div className="flex-1 min-w-0">
        {/* Hero Banner */}
      <div className="relative bg-gradient-to-r from-yellow-600/20 via-yellow-500/10 to-transparent border border-yellow-600/30 rounded-2xl p-8 mb-8 overflow-hidden">
        <div className="absolute right-0 top-0 w-1/2 h-full opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-400 via-transparent to-transparent" />
        </div>
        <div className="relative z-10">
          <div className="inline-block bg-yellow-600/20 text-yellow-500 text-xs px-3 py-1 rounded-full mb-4">
            ⚡ 注意力工作量证明协议
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            观看直播，赚取代币
          </h1>
          <p className="text-lg text-default-500 mb-6">
            完成"注意力证明"任务，参与瓜分 1,000,000 $ATTN 奖池。
          </p>
          <button className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-6 py-3 rounded-lg transition-colors">
            快速开始
          </button>
        </div>
      </div>

      {/* Task Section Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">实时任务直播</h2>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-lg bg-default-100 hover:bg-default-200 transition-colors">
            全部
          </button>
          <button className="px-4 py-2 rounded-lg hover:bg-default-100 transition-colors">
            热门
          </button>
          <button className="px-4 py-2 rounded-lg hover:bg-default-100 transition-colors">
            实时
          </button>
        </div>
      </div>

      {/* Task Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onJoinTask={handleJoinTask} />
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-12 text-default-500">
          暂无可用任务
        </div>
      )}
      </div>

      {selectedTask && (
        <VerificationModal
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          task={selectedTask}
          userId={userId}
          onSuccess={handleVerificationSuccess}
        />
      )}

      <SuccessAnimation
        isVisible={showSuccess}
        points={earnedPoints}
        onComplete={() => setShowSuccess(false)}
      />
    </div>
  );
}
