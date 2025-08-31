'use client'
import Image from 'next/image'
import Link from 'next/link';
import React, { useState, useEffect } from 'react'
import {
  AiOutlineMenu,
  AiOutlineHome,
  AiOutlineShopping,
  AiOutlineStock,
  AiOutlineWallet
} from "react-icons/ai";
import {
  FiPackage,
  FiTruck,
  FiXCircle,
  FiCheckCircle,
  FiUser,
  FiLogOut,
  FiChevronDown,
  FiChevronRight
} from 'react-icons/fi';
import {
  MdDashboard,
  MdInventory,
  MdOutlineInventory2,
  MdOutlineDisabledByDefault
} from 'react-icons/md';
import {
  BsBoxSeam,
  BsClockHistory
} from 'react-icons/bs';
import toast from 'react-hot-toast';
import { useRouter, usePathname } from 'next/navigation';

const Sidebar = () => {
  const [isStockOpen, setIsStockOpen] = useState(false);
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarVisible, setIsMobileSidebarVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();
  const pathname = usePathname(); // Get current pathname

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileSidebarVisible(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    if (window.innerWidth < 768) {
      setIsMobileSidebarVisible(!isMobileSidebarVisible);
    } else {
      setIsSidebarOpen(!isSidebarOpen);
    }
  };

  const handleMobileNav = () => {
    if (window.innerWidth < 768) {
      setIsMobileSidebarVisible(false);
    }
  };

  const NavLink = ({ href, children }: { href: string, children: React.ReactNode }) => (
    <Link href={href} onClick={handleMobileNav}>
      {children}
    </Link>
  );

  const handleLogout = () => {
    // Clear cookies
    document.cookie = 'pharmacyId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'pharmacyName=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

    // Show success message
    toast.success('Logged out successfully');

    // Redirect to login page
    router.push('/login');

    // Close mobile sidebar if open
    if (window.innerWidth < 768) {
      setIsMobileSidebarVisible(false);
    }
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        onClick={toggleSidebar} 
        className='md:hidden p-3 fixed top-4 left-4 z-50 bg-white rounded-lg shadow-md hover:shadow-lg transition-all'
      >
        <AiOutlineMenu className='text-xl text-gray-800' />
      </button>

      {/* Mobile Backdrop */}
      {isMobileSidebarVisible && (
        <div
          onClick={() => setIsMobileSidebarVisible(false)}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <div 
        className={`
          h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700
          text-gray-800 dark:text-gray-200 transition-all duration-300 ease-in-out
         ${isSidebarOpen ? 'w-[250px]' : 'w-[70px]'}
          ${isMobileSidebarVisible ? 'left-0' : '-left-full'}
             md:static fixed top-0 z-40 overflow-y-auto
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className='flex flex-col h-full'>
          {/* Sidebar Header */}
          <div className='p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between'>
            {isSidebarOpen ? (
              <div className="flex items-center">
                <Image 
                  src={'/logo.png'} 
                  alt='logo' 
                  height={40} 
                  width={150} 
                  className="h-10 object-contain"
                />
              </div>
            ) : (
              <div className="flex justify-center w-full">
                <Image 
                  src={'/logo-icon.png'} 
                  alt='logo' 
                  height={40} 
                  width={40} 
                  className="h-10 w-10 object-contain"
                />
              </div>
            )}
            
            <button 
              onClick={toggleSidebar} 
              className="hidden md:block p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <AiOutlineMenu className='text-xl' />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto">
            <ul className='space-y-1'>
              {/* Dashboard */}
              <li>
                <NavLink href="/">
                  <div className={`
                    flex items-center p-3 rounded-lg 
                    ${pathname === '/' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''}
                    hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
                  `}>
                    <AiOutlineHome className="text-xl min-w-[24px]" />
                    {(isSidebarOpen || isHovered) && <span className="ml-3">Dashboard</span>}
                  </div>
                </NavLink>
              </li>

              {/* Stocks Section */}
              <li>
                <button
                  type="button"
                  onClick={() => setIsStockOpen(!isStockOpen)}
                  className={`
                    flex items-center justify-between w-full p-3 rounded-lg 
                    hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
                  `}
                >
                  <div className="flex items-center">
                    <MdInventory className="text-xl min-w-[24px]" />
                    {(isSidebarOpen || isHovered) && <span className="ml-3">Stocks</span>}
                  </div>
                  {(isSidebarOpen || isHovered) && (
                    isStockOpen ? <FiChevronDown /> : <FiChevronRight />
                  )}
                </button>
                
                {(isStockOpen && (isSidebarOpen || isHovered)) && (
                  <ul className="py-1 pl-4 ml-5 space-y-1 border-l border-gray-200 dark:border-gray-700">
                    <li>
                      <NavLink href="/stocks/active">
                        <div className={`
                          flex items-center p-2 rounded-lg 
                          ${pathname === '/stocks/active' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''}
                          hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
                        `}>
                          <MdOutlineInventory2 className="text-lg min-w-[20px]" />
                          <span className="ml-2">Active Stock</span>
                        </div>
                      </NavLink>
                    </li>
                    <li>
                      <NavLink href="/stocks/out-of-stock">
                        <div className={`
                          flex items-center p-2 rounded-lg 
                          ${pathname === '/stocks/out-of-stock' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''}
                          hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
                        `}>
                          <AiOutlineStock className="text-lg min-w-[20px]" />
                          <span className="ml-2">Out of Stock</span>
                        </div>
                      </NavLink>
                    </li>
                  </ul>
                )}
              </li>

              {/* Orders Section */}
              <li>
                <button
                  type="button"
                  onClick={() => setIsOrderOpen(!isOrderOpen)}
                  className={`
                    flex items-center justify-between w-full p-3 rounded-lg 
                    hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
                  `}
                >
                  <div className="flex items-center">
                    <AiOutlineShopping className="text-xl min-w-[24px]" />
                    {(isSidebarOpen || isHovered) && <span className="ml-3">Orders</span>}
                  </div>
                  {(isSidebarOpen || isHovered) && (
                    isOrderOpen ? <FiChevronDown /> : <FiChevronRight />
                  )}
                </button>
                
                {(isOrderOpen && (isSidebarOpen || isHovered)) && (
                  <ul className="py-1 pl-4 ml-5 space-y-1 border-l border-gray-200 dark:border-gray-700">
                    <li>
                      <NavLink href="/orders/delivered">
                        <div className={`
                          flex items-center p-2 rounded-lg 
                          ${pathname === '/orders/delivered' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''}
                          hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
                        `}>
                          <FiTruck className="text-lg min-w-[20px]" />
                          <span className="ml-2">Delivered</span>
                        </div>
                      </NavLink>
                    </li>
                    <li>
                      <NavLink href="/orders/pending">
                        <div className={`
                          flex items-center p-2 rounded-lg 
                          ${pathname === '/orders/pending' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''}
                          hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
                        `}>
                          <BsClockHistory className="text-lg min-w-[20px]" />
                          <span className="ml-2">Pending</span>
                        </div>
                      </NavLink>
                    </li>
                    <li>
                      <NavLink href="/orders/cancelled">
                        <div className={`
                          flex items-center p-2 rounded-lg 
                          ${pathname === '/orders/cancelled' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''}
                          hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
                        `}>
                          <FiXCircle className="text-lg min-w-[20px]" />
                          <span className="ml-2">Cancelled</span>
                        </div>
                      </NavLink>
                    </li>
                  </ul>
                )}
              </li>

              {/* Account */}
              <li>
                <NavLink href="/account">
                  <div className={`
                    flex items-center p-3 rounded-lg 
                    ${pathname === '/account' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''}
                    hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
                  `}>
                    <AiOutlineWallet className="text-xl min-w-[24px]" />
                    {(isSidebarOpen || isHovered) && <span className="ml-3">Account</span>}
                  </div>
                </NavLink>
              </li>
            </ul>
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
            <NavLink href="/profile">
              <div className={`
                flex items-center p-2 rounded-lg 
                ${pathname === '/profile' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''}
                hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
              `}>
                <FiUser className="text-lg min-w-[20px]" />
                {(isSidebarOpen || isHovered) && <span className="ml-2">Profile</span>}
              </div>
            </NavLink>
            
            <button
              onClick={handleLogout}
              className={`
                flex items-center justify-center w-full p-2 rounded-lg 
                bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400
                hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors
              `}
            >
              <FiLogOut className="text-lg min-w-[20px]" />
              {(isSidebarOpen || isHovered) && <span className="ml-2">Logout</span>}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;