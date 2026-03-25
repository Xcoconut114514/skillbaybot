'use client';

import { useState } from 'react';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Button } from '@heroui/button';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@heroui/table';
import { Chip } from '@heroui/chip';
import Image from 'next/image';

/**
 * 支付记录数据接口
 */
interface Payment {
  id: string;                                    // 支付ID
  productName: string;                           // 商品名称
  amount: number;                                // 金额
  status: 'pending' | 'processing' | 'completed'; // 状态
  buyer: string;                                 // 买家地址
  date: string;                                  // 日期
}

/**
 * 支付清算与结算页面
 * 功能：查看支付状态，触发清算操作
 */
export default function SettlementPage() {
  // 支付记录列表状态
  const [payments, setPayments] = useState<Payment[]>([
    {
      id: 'PAY001',
      productName: 'Copper Ore',
      amount: 500000,
      status: 'pending',
      buyer: '0x1234...5678',
      date: '2025-12-05',
    },
    {
      id: 'PAY002',
      productName: 'Crude Oil',
      amount: 2000000,
      status: 'processing',
      buyer: '0xabcd...efgh',
      date: '2025-12-04',
    },
    {
      id: 'PAY003',
      productName: 'Iron Ore',
      amount: 800000,
      status: 'completed',
      buyer: '0x9876...5432',
      date: '2025-12-03',
    },
  ]);

  /**
   * 触发清算操作
   */
  const handleSettle = (paymentId: string) => {
    setPayments(
      payments.map((p) =>
        p.id === paymentId ? { ...p, status: 'completed' as const } : p
      )
    );
    alert(`Payment ${paymentId} settlement completed`);
  };

  /**
   * 根据状态返回对应的颜色
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'processing':
        return 'primary';
      case 'completed':
        return 'success';
      default:
        return 'default';
    }
  };

  /**
   * 根据状态返回对应的文本
   */
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'processing':
        return 'Processing';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  /**
   * 根据状态返回对应的图标
   */
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'processing':
        return '⚡';
      case 'completed':
        return '✅';
      default:
        return '📄';
    }
  };

  // 计算统计数据
  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
  const pendingCount = payments.filter(p => p.status === 'pending').length;
  const completedCount = payments.filter(p => p.status === 'completed').length;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 背景图片 */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/background.png"
          alt="background"
          fill
          className="object-cover opacity-30"
          priority
        />
      </div>

      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#FFA500]">
          Payment Settlement
        </h1>
        <p className="text-gray-500 mt-2">Real-time payment status and settlement operations</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-[#141414] border border-zinc-800 hover:border-[#FFA500] transition-colors">
          <CardBody className="p-6">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <span className="text-3xl opacity-60">🔒</span>
              </div>
              <p className="text-lg font-semibold text-gray-300 mb-2">Product Management</p>
              <p className="text-sm text-gray-500">Register and manage your commodity</p>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-[#141414] border-2 border-[#FFA500] hover:border-[#FFB800] transition-colors">
          <CardBody className="p-6">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <span className="text-3xl opacity-80">🔒</span>
              </div>
              <p className="text-lg font-semibold text-gray-300 mb-2">Product Management</p>
              <p className="text-sm text-gray-500">Register and manage your commodity</p>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-[#141414] border border-zinc-800 hover:border-[#FFA500] transition-colors">
          <CardBody className="p-6">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <span className="text-3xl opacity-60">🔒</span>
              </div>
              <p className="text-lg font-semibold text-gray-300 mb-2">Product Management</p>
              <p className="text-sm text-gray-500">Register and manage your commodity</p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* 支付记录表格卡片 */}
      <Card className="bg-[#141414] border border-zinc-800">
        <CardHeader className="border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center">
              <span className="text-lg opacity-60">🔒</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-300">Payment Records</h2>
          </div>
        </CardHeader>
        <CardBody className="p-6">
          <Table 
            aria-label="Payment settlement list"
            classNames={{
              wrapper: "shadow-none bg-transparent",
              th: "bg-transparent text-gray-500 font-medium text-xs uppercase",
              td: "text-gray-400 border-b border-zinc-800/50",
            }}
          >
            <TableHeader>
              <TableColumn>PAYMENT ID</TableColumn>
              <TableColumn>PRODUCT NAME</TableColumn>
              <TableColumn>AMOUNT (USDT)</TableColumn>
              <TableColumn>BUYER ADDRESS</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>DATE</TableColumn>
              <TableColumn>ACTION</TableColumn>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id} className="hover:bg-zinc-900/30 transition-colors">
                  <TableCell>
                    <span className="font-mono text-gray-400">{payment.id}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-gray-300">{payment.productName}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-gray-400">
                      ${payment.amount.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm text-gray-500">
                      {payment.buyer}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      className="bg-transparent text-gray-500 border border-zinc-700"
                      variant="bordered" 
                      size="sm"
                    >
                      {getStatusText(payment.status)}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <span className="text-gray-500">{payment.date}</span>
                  </TableCell>
                  <TableCell>
                    {payment.status === 'pending' && (
                      <Button
                        size="sm"
                        onPress={() => handleSettle(payment.id)}
                        className="bg-zinc-800 hover:bg-zinc-700 text-gray-300 border border-zinc-700"
                      >
                        Get Started
                      </Button>
                    )}
                    {payment.status === 'processing' && (
                      <span className="text-sm text-gray-500">Processing...</span>
                    )}
                    {payment.status === 'completed' && (
                      <span className="text-sm text-gray-500">Done</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
}
