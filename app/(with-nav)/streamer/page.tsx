'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Spinner } from '@heroui/spinner';
import { Progress } from '@heroui/progress';
import { getStreamerStats } from '@/lib/api/attention';
import type { StreamerStats } from '@/types/attention';

export default function StreamerPage() {
  const [stats, setStats] = useState<StreamerStats[]>([]);
  const [loading, setLoading] = useState(true);
  
  const streamerId = 'streamer-123';

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 10000); // 每10秒刷新
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      const data = await getStreamerStats(streamerId);
      setStats(data);
    } catch (error) {
      console.error('Failed to load streamer stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">主播控制台</h1>

      <div className="grid gap-6">
        {stats.map((stat) => (
          <Card key={stat.taskId}>
            <CardHeader>
              <h2 className="text-xl font-semibold">{stat.taskTitle}</h2>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{stat.activeViewers}</p>
                  <p className="text-sm text-default-500 mt-1">当前观众</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-warning">{stat.totalPoints}</p>
                  <p className="text-sm text-default-500 mt-1">累计积分</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-success">
                    {(stat.verificationRate * 100).toFixed(1)}%
                  </p>
                  <p className="text-sm text-default-500 mt-1">验证成功率</p>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>观众活跃度</span>
                  <span>{stat.verificationRate * 100}%</span>
                </div>
                <Progress
                  value={stat.verificationRate * 100}
                  color="success"
                  size="sm"
                />
              </div>
            </CardBody>
          </Card>
        ))}

        {stats.length === 0 && (
          <Card>
            <CardBody className="text-center py-12 text-default-500">
              暂无进行中的任务
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}
