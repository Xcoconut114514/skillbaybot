'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Spinner } from '@heroui/spinner';
import { Chip } from '@heroui/chip';
import { getUser, getPointRecords } from '@/lib/api/attention';
import type { User, PointRecord } from '@/types/attention';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [records, setRecords] = useState<PointRecord[]>([]);
  const [loading, setLoading] = useState(true);
  
  const userId = 'user-123';

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const [userData, recordsData] = await Promise.all([
        getUser(userId),
        getPointRecords(userId),
      ]);
      setUser(userData);
      setRecords(recordsData);
    } catch (error) {
      console.error('Failed to load user data:', error);
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
      <h1 className="text-3xl font-bold mb-8">个人中心</h1>

      <Card className="mb-6">
        <CardHeader className="pb-0">
          <h2 className="text-xl font-semibold">我的积分</h2>
        </CardHeader>
        <CardBody>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-4xl font-bold text-warning">{user?.totalPoints || 0}</p>
              <p className="text-sm text-default-500 mt-1">总积分</p>
            </div>
            {user?.rank && (
              <Chip color="primary" variant="flat" size="lg">
                排名 #{user.rank}
              </Chip>
            )}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader className="pb-0">
          <h2 className="text-xl font-semibold">积分记录</h2>
        </CardHeader>
        <CardBody>
          <div className="space-y-3">
            {records.map((record) => (
              <div
                key={record.id}
                className="flex justify-between items-center p-3 rounded-lg bg-default-100"
              >
                <div>
                  <p className="font-medium">{record.taskTitle}</p>
                  <p className="text-sm text-default-500">
                    {new Date(record.timestamp).toLocaleString('zh-CN')}
                  </p>
                </div>
                <p className={`font-semibold ${record.type === 'earn' ? 'text-success' : 'text-danger'}`}>
                  {record.type === 'earn' ? '+' : '-'}{record.points}
                </p>
              </div>
            ))}
            {records.length === 0 && (
              <p className="text-center py-8 text-default-500">暂无记录</p>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
