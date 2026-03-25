'use client';

import { Card, CardBody, CardHeader } from '@heroui/card';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@heroui/table';
import Image from 'next/image';

/**
 * 数据分析与分润管理页面
 * 功能：展示收入、分润数据和历史记录
 */
export default function AnalyticsPage() {
  // 收入数据列表
  const revenueData = [
    { date: '2025-12-01', revenue: 5000, commission: 250 },
    { date: '2025-12-02', revenue: 8000, commission: 400 },
    { date: '2025-12-03', revenue: 12000, commission: 600 },
    { date: '2025-12-04', revenue: 15000, commission: 750 },
    { date: '2025-12-05', revenue: 20000, commission: 1000 },
  ];

  // 计算总收入和总分润
  const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);
  const totalCommission = revenueData.reduce((sum, item) => sum + item.commission, 0);

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
          Data Analytics & Commission
        </h1>
        <p className="text-gray-500 mt-2">Track your revenue and commission performance</p>
      </div>

      {/* 统计数据卡片 */}
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

      {/* 收入与分润记录表格 */}
      <Card className="bg-[#141414] border border-zinc-800">
        <CardHeader className="border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center">
              <span className="text-lg opacity-60">🔒</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-300">Revenue & Commission Records</h2>
          </div>
        </CardHeader>
        <CardBody className="p-6">
          <Table 
            aria-label="Revenue and commission table"
            classNames={{
              wrapper: "shadow-none bg-transparent",
              th: "bg-transparent text-gray-500 font-medium text-xs uppercase",
              td: "text-gray-400 border-b border-zinc-800/50",
            }}
          >
            <TableHeader>
              <TableColumn>DATE</TableColumn>
              <TableColumn>REVENUE (USDT)</TableColumn>
              <TableColumn>COMMISSION (USDT)</TableColumn>
              <TableColumn>RATE</TableColumn>
            </TableHeader>
            <TableBody>
              {revenueData.map((item, index) => (
                <TableRow key={index} className="hover:bg-zinc-900/30 transition-colors">
                  <TableCell>
                    <span className="font-medium text-gray-400">{item.date}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-gray-400">
                      ${item.revenue.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-gray-400">
                      ${item.commission.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-transparent border border-zinc-700 text-gray-500">
                      5%
                    </span>
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
