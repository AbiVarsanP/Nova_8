import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiHome, FiSearch, FiBox, FiPlay, FiGithub, FiCpu, FiCode } = FiIcons;

const Navigation = () => {
  const navItems = [
    { path: '/', icon: FiHome, label: 'Dashboard' },
    { path: '/analyze', icon: FiSearch, label: 'Analyze' },
    { path: '/dockerfile', icon: FiBox, label: 'Dockerfile' },
    { path: '/test', icon: FiPlay, label: 'Test' },
    { path: '/github', icon: FiGithub, label: 'GitHub' },
    { path: '/code-analyzer', icon: FiCode, label: 'Analyzer' },
  ];

  return (
    <nav className="bg-dark-800 border-b border-dark-700 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <motion.div 
            className="flex items-center space-x-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <SafeIcon icon={FiCpu} className="w-8 h-8 text-primary-400" />
            <h1 className="text-xl font-bold text-white">Agentic AI</h1>
          </motion.div>
          
          <div className="flex space-x-1">
            {navItems.map((item, index) => (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-primary-600 text-white shadow-lg'
                        : 'text-dark-300 hover:text-white hover:bg-dark-700'
                    }`
                  }
                >
                  <SafeIcon icon={item.icon} className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </NavLink>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;