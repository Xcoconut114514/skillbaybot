'use client';

import { useState, useEffect } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@heroui/modal';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Progress } from '@heroui/progress';
import { submitVerificationCode } from '@/lib/api/attention';
import type { Task } from '@/types/attention';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  userId: string;
  onSuccess: (points: number) => void;
}

export function VerificationModal({
  isOpen,
  onClose,
  task,
  userId,
  onSuccess,
}: VerificationModalProps) {
  const [code, setCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(60); // 60秒倒计时
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setCode('');
      setTimeLeft(60);
      setError('');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!code.trim()) {
      setError('请输入验证码');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const result = await submitVerificationCode(task.id, code, userId);
      
      if (result.success) {
        onSuccess(result.points || 0);
        onClose();
      } else {
        setError(result.message || '验证失败，请重试');
      }
    } catch (err) {
      setError('提交失败，请检查网络连接');
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressValue = (timeLeft / 60) * 100;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          输入验证码
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <p className="text-sm text-default-500">
              请输入主播口播的验证码以获得 <span className="text-warning font-semibold">+{task.reward} 积分</span>
            </p>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>剩余时间</span>
                <span className={timeLeft <= 10 ? 'text-danger' : 'text-default-500'}>
                  {timeLeft}秒
                </span>
              </div>
              <Progress
                value={progressValue}
                color={timeLeft <= 10 ? 'danger' : 'primary'}
                size="sm"
              />
            </div>

            <Input
              label="验证码"
              placeholder="输入主播口播的验证码"
              value={code}
              onValueChange={setCode}
              isDisabled={timeLeft === 0 || isSubmitting}
              errorMessage={error}
              isInvalid={!!error}
              autoFocus
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            取消
          </Button>
          <Button
            color="primary"
            onPress={handleSubmit}
            isLoading={isSubmitting}
            isDisabled={timeLeft === 0 || !code.trim()}
          >
            提交验证
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
