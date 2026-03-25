'use client';

import { Card, CardBody, CardFooter } from '@heroui/card';
import { Button } from '@heroui/button';
import { Chip } from '@heroui/chip';
import { User } from '@heroui/user';
import type { Task } from '@/types/attention';

interface TaskCardProps {
  task: Task;
  onJoinTask: (task: Task) => void;
}

export function TaskCard({ task, onJoinTask }: TaskCardProps) {
  const statusText = {
    active: '直播中',
    upcoming: '即将开始',
    ended: '已结束',
  }[task.status];

  // 根据任务ID生成不同的渐变色
  const gradients = [
    'from-yellow-600/80 via-yellow-700/60 to-yellow-900/80',
    'from-orange-600/80 via-red-700/60 to-red-900/80',
    'from-purple-600/80 via-purple-700/60 to-purple-900/80',
    'from-blue-600/80 via-blue-800/60 to-blue-900/80',
  ];
  
  const gradientIndex = parseInt(task.id.split('-')[1] || '0') % gradients.length;
  const gradient = gradients[gradientIndex];

  return (
    <Card className="w-full overflow-hidden border-0">
      {/* 渐变背景区域 */}
      <div className={`relative h-48 bg-gradient-to-br ${gradient} p-4 flex flex-col justify-between`}>
        {/* 状态标签 */}
        {task.status === 'active' && (
          <div className="absolute top-4 left-4">
            <Chip 
              color="danger" 
              variant="solid" 
              size="sm"
              className="font-semibold"
            >
              {statusText}
            </Chip>
          </div>
        )}
        
        {/* 参与人数 */}
        <div className="absolute bottom-4 left-4">
          <div className="text-white text-sm font-medium">
            {task.participantCount.toLocaleString()} 人观看
          </div>
        </div>
      </div>

      {/* 信息区域 */}
      <CardBody className="p-4 bg-default-50 dark:bg-default-100/50">
        <div className="flex items-start gap-3 mb-3">
          <User
            name={task.title}
            description={task.streamerName}
            avatarProps={{ 
              size: 'sm',
              className: 'flex-shrink-0'
            }}
            classNames={{
              name: 'font-semibold text-sm',
              description: 'text-xs'
            }}
          />
        </div>

        <div className="flex items-center justify-between">
          <Chip 
            color="warning" 
            variant="flat" 
            size="sm"
            className="font-semibold"
          >
            奖励 {task.reward} 积分
          </Chip>
          
          <Button
            size="sm"
            color="primary"
            variant="flat"
            isDisabled={task.status !== 'active'}
            onPress={() => onJoinTask(task)}
            className="font-semibold"
          >
            {task.status === 'active' ? '参与' : '已结束'}
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
