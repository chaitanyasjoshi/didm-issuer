import React from 'react';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import multiavatar from '@multiavatar/multiavatar';

import auth from '../utils/auth';

import logo from '../assets/logo.png';
import { ReactComponent as Menu } from '../assets/icons/menu.svg';
import { ReactComponent as Close } from '../assets/icons/close.svg';
import { ReactComponent as Logout } from '../assets/icons/logout.svg';

export default function Navbar(props) {
  const [showMenu, setMenu] = useState(false);
  return (
    <nav className='bg-gray-800 font-Poppins'>
      <div className='max-w-7xl mx-auto px-2 sm:px-6 lg:px-8'>
        <div className='relative flex items-center justify-between h-16'>
          <div className='absolute inset-y-0 left-0 flex items-center sm:hidden'>
            {/* Mobile menu button */}
            <button
              type='button'
              onClick={() => {
                setMenu(!showMenu);
              }}
              className='inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white'
              aria-controls='mobile-menu'
              aria-expanded='false'
            >
              <span className='sr-only'>Open main menu</span>
              {/* Heroicon name: outline/menu*/}
              <Menu className={`${showMenu ? 'hidden' : 'block'} h-6 w-6`} />
              {/* Heroicon name: outline/x*/}
              <Close className={`${showMenu ? 'block' : 'hidden'} h-6 w-6`} />
            </button>
          </div>
          <div className='flex-1 flex items-center justify-center sm:items-stretch sm:justify-start'>
            <div className='flex-shrink-0 flex items-center'>
              <img
                className='hidden lg:block h-8 w-auto'
                src={logo}
                alt='logo'
              />
            </div>
            <div className='hidden sm:block sm:ml-6'>
              <div className='flex space-x-4'>
                {/* Current: "bg-gray-900 text-white", Default: "text-gray-300 hover:bg-gray-700 hover:text-white" */}
                <NavLink
                  to='/dashboard'
                  activeClassName='bg-gray-900 text-white hover:bg-gray-900'
                  className='transition-colors duration-100 ease-in text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium'
                >
                  Dashboard
                </NavLink>
              </div>
            </div>
          </div>
          <div className='absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0'>
            <div className='flex items-center'>
              <div className='mr-4'>
                <div className='text-sm font-medium text-white'>
                  {props.user}
                </div>
                <div className='text-sm text-right text-gray-300'>
                  {auth.getUsername()}
                </div>
              </div>
              <div className='flex-shrink-0 h-10 w-10'>
                <span
                  className='h-10 w-10 rounded-full'
                  dangerouslySetInnerHTML={{
                    __html: multiavatar(props.user),
                  }}
                />
              </div>
            </div>

            <div className='ml-3 relative'>
              <button
                onClick={() => {
                  auth.logout(() => {
                    props.history.push('/');
                  });
                }}
                className='bg-gray-800 p-1 rounded-full text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white'
              >
                <span className='sr-only'>Logout</span>
                {/* Heroicon name: outline/logout */}
                <Logout className='h-6 w-6' />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state. */}
      <div
        className={`${showMenu ? 'block' : 'hidden'} sm:hidden`}
        id='mobile-menu'
      >
        <div className='px-2 pt-2 pb-3 space-y-1'>
          <NavLink
            to='/dashboard'
            activeClassName='bg-gray-900 text-white'
            className='text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium'
          >
            Dashboard
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
