'use client';

import { Card, CardBody } from '@heroui/card';
import { Button } from '@heroui/button';
import { Link } from '@heroui/link';

/**
 * 首页组件 - 深色极客风格
 * 展示 PicWe CCN 平台的主要功能模块入口
 */
export default function HomePage() {
  return (
    <section className="flex flex-col items-center justify-center gap-16 py-16 md:py-20 min-h-screen">
      {/* 标题区域 - 深色极客风格 */}
      <div className="text-center max-w-4xl px-4">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-[#FFA500]">
          Cargo X Commodity Credit Network
        </h1>
        <p className="text-xl md:text-2xl text-gray-400 mb-4 font-light">
          Global Commodity Financing & Settlement Platform
        </p>
        <p className="text-base md:text-lg text-gray-500 leading-relaxed max-w-3xl mx-auto">
          Transform traditional commodity trade into on-chain financeable credit assets through blockchain technology
        </p>
      </div>

      {/* 主要功能卡片 - 3列布局 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl px-4">
        {/* 商品管理卡片 */}
        <Card className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 hover:border-zinc-700 transition-all group">
          <CardBody className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-lg bg-zinc-800 flex items-center justify-center group-hover:bg-zinc-700 transition-colors">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-200 mb-3">
              Product Management
            </h3>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              Register and manage your commodity assets with unique on-chain asset IDs
            </p>
            <Button 
              as={Link} 
              href="/products"
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-gray-300 border border-zinc-700"
              size="lg"
            >
              Get Started
            </Button>
          </CardBody>
        </Card>

        {/* 融资申请卡片 */}
        <Card className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 hover:border-zinc-700 transition-all group">
          <CardBody className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-lg bg-zinc-800 flex items-center justify-center group-hover:bg-zinc-700 transition-colors">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-200 mb-3">
              Financing Application
            </h3>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              Quick financing based on commodity assets with multiple pool options
            </p>
            <Button 
              as={Link} 
              href="/financing"
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-gray-300 border border-zinc-700"
              size="lg"
            >
              Get Started
            </Button>
          </CardBody>
        </Card>

        {/* 融资池卡片 */}
        <Card className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 hover:border-zinc-700 transition-all group">
          <CardBody className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-lg bg-zinc-800 flex items-center justify-center group-hover:bg-zinc-700 transition-colors">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-200 mb-3">
              Financing Pools
            </h3>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              Participate in financing pools and earn stable on-chain returns
            </p>
            <Button 
              as={Link} 
              href="/pools"
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-gray-300 border border-zinc-700"
              size="lg"
            >
              Get Started
            </Button>
          </CardBody>
        </Card>
      </div>

      {/* 核心优势区域 - 深色风格 */}
      <div className="w-full max-w-6xl px-4 mt-8">
        <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-12">
          <h3 className="text-3xl font-bold text-center mb-12 text-gray-200">
            Core Advantages
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 快速融资 */}
            <div className="text-center p-6 rounded-xl border border-zinc-800 hover:border-yellow-600/50 transition-all group">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-zinc-700 group-hover:border-yellow-600 flex items-center justify-center transition-colors">
                <svg className="w-8 h-8 text-gray-400 group-hover:text-yellow-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="font-semibold text-lg mb-2 text-gray-300">Fast Financing</h4>
              <p className="text-gray-500 text-sm">
                Register and manage your commodity
              </p>
            </div>

            {/* 安全透明 - 高亮 */}
            <div className="text-center p-6 rounded-xl border-2 border-yellow-600 bg-yellow-600/5 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/10 to-transparent"></div>
              <div className="relative">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-yellow-600 flex items-center justify-center">
                  <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-lg mb-2 text-yellow-500">Secure & Transparent</h4>
                <p className="text-gray-400 text-sm">
                  Register and manage your commodity
                </p>
              </div>
            </div>

            {/* 稳定收益 */}
            <div className="text-center p-6 rounded-xl border border-zinc-800 hover:border-yellow-600/50 transition-all group">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-zinc-700 group-hover:border-yellow-600 flex items-center justify-center transition-colors">
                <svg className="w-8 h-8 text-gray-400 group-hover:text-yellow-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h4 className="font-semibold text-lg mb-2 text-gray-300">Stable Returns</h4>
              <p className="text-gray-500 text-sm">
                Register and manage your commodity
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
