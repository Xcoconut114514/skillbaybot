'use client'

import { useState } from 'react'
import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@heroui/navbar";
import { Button } from "@heroui/button";
import { Kbd } from "@heroui/kbd";
import { Link } from "@heroui/link";
import { Input } from "@heroui/input";
import { link as linkStyles } from "@heroui/theme";
import NextLink from "next/link";
import Image from "next/image";
import clsx from "clsx";
import ConnectWallet from './ConnectWallet';
import { PopupAssistant } from './popup-assistant';
import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import {
  TwitterIcon,
  GithubIcon,
  DiscordIcon,
  HeartFilledIcon,
  SearchIcon,
  Logo,
} from "@/components/icons";

export const Navbar = () => {
  const [isAIOpen, setIsAIOpen] = useState(false)
  const searchInput = (
    <button
      type="button"
      onClick={() => setIsAIOpen(true)}
      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-[#FFA500] font-medium text-sm transition-all"
      aria-label="Toggle AI Chat"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
      Ask AI
    </button>
  );

  return (
    <HeroUINavbar 
      maxWidth="xl" 
      position="sticky"
      className="backdrop-blur-md bg-black/80 border-b border-zinc-800"
      classNames={{
        wrapper: "px-4 sm:px-6",
      }}
    >
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-2 hover:opacity-80 transition-opacity" href="/skills">
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <div className="flex flex-col">
              <p className="font-bold text-base">
                Skills<span className="text-blue-500">Bay</span>
              </p>
            </div>
          </NextLink>
        </NavbarBrand>
        <ul className="hidden lg:flex gap-1 justify-start ml-4">
          {siteConfig.navItems.map((item) => (
            <NavbarItem key={item.href}>
              <NextLink
                className={clsx(
                  "px-4 py-2 rounded-lg font-medium transition-all text-gray-400 hover:text-gray-200 hover:bg-zinc-800",
                  "data-[active=true]:bg-gradient-to-r data-[active=true]:from-yellow-600 data-[active=true]:to-orange-600",
                  "data-[active=true]:text-white data-[active=true]:shadow-md",
                )}
                href={item.href}
              >
                {item.label}
              </NextLink>
            </NavbarItem>
          ))}
        </ul>
      </NavbarContent>

      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        <NavbarItem className="hidden sm:flex gap-2">
          <Link 
            isExternal 
            aria-label="Twitter" 
            href={siteConfig.links.twitter}
            className="p-2 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <TwitterIcon className="text-gray-600 hover:text-blue-400 transition-colors" />
          </Link>
          <Link 
            isExternal 
            aria-label="Documentation" 
            href="https://www.yuque.com/wudihaoke-o3lci/hmab3i/rmuh6o9k5gvrbka1?singleDoc"
            className="p-2 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600 hover:text-green-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </Link>
          <Link 
            isExternal 
            aria-label="Github" 
            href={siteConfig.links.github}
            className="p-2 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <GithubIcon className="text-gray-600 hover:text-gray-300 transition-colors" />
          </Link>
          <div className="p-2">
            <ThemeSwitch />
          </div>
        </NavbarItem>
        <NavbarItem className="hidden lg:flex">{searchInput}</NavbarItem>
        <NavbarItem className="hidden md:flex">
          <ConnectWallet />
        </NavbarItem>
      </NavbarContent>

      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <Link 
          isExternal 
          aria-label="Github" 
          href={siteConfig.links.github}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <GithubIcon className="text-gray-600" />
        </Link>
        <ThemeSwitch />
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarMenu className="backdrop-blur-md bg-white/90">
        <div className="py-4">
          {searchInput}
        </div>
        <div className="mx-4 mt-2 flex flex-col gap-2">
          {siteConfig.navItems.map((item, index) => (
            <NavbarMenuItem key={`${item.label}-${index}`}>
              <NextLink
                className="w-full px-4 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                href={item.href}
              >
                {item.label}
              </NextLink>
            </NavbarMenuItem>
          ))}
        </div>
      </NavbarMenu>

      {/* AI Assistant Popup */}
      <PopupAssistant isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} />
    </HeroUINavbar>
  );
};
