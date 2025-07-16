import React from 'react';
import { motion } from 'framer-motion';
import { useProject } from '../context/ProjectContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { Link } from 'react-router-dom';

const { FiGitBranch, FiPackage, FiBox, FiCheck, FiClock, FiTrendingUp, FiCode } = FiIcons;

const Dashboard = () => {
  const { state } = useProject();
  
  const stats = [
    {
      label: 'Projects Analyzed',
      value: state.currentProject ? '1' : '0',
      icon: FiGitBranch,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10'
    },
    {
      label: 'Dependencies Found',
      value: state.dependencies.length,
      icon: FiPackage,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10'
    },
    {
      label: 'Dockerfile Generated',
      value: state.dockerfile ? '1' : '0',
      icon: FiBox,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10'
    },
    {
      label: 'Code Analysis',
      value: state.codeAnalysisResults ? 'Complete' : 'Pending',
      icon: FiCode,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10'
    }
  ];

  const recentActivities = [
    { action: 'Repository cloned', time: '2 minutes ago', status: 'completed' },
    { action: 'Dependencies analyzed', time: '1 minute ago', status: 'completed' },
    { action: 'Dockerfile generated', time: '30 seconds ago', status: 'completed' },
    { action: 'Code analyzer added', time: 'Just now', status: 'running' }
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-white mb-4">
          Agentic AI Development System
        </h1>
        <p className="text-dark-300 text-lg max-w-2xl mx-auto">
          Automatically clone repositories, analyze tech stacks, generate Dockerfiles, 
          test deployments, and push to GitHub with AI-powered intelligence.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-dark-800 rounded-xl p-6 border border-dark-700 hover:border-dark-600 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-dark-400 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <SafeIcon icon={stat.icon} className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-dark-800 rounded-xl p-6 border border-dark-700"
        >
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <SafeIcon icon={FiClock} className="w-5 h-5 mr-2 text-primary-400" />
            Recent Activity
          </h3>
          <div className="space-y-3">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-dark-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.status === 'completed' ? 'bg-green-400' : 'bg-yellow-400 animate-pulse'
                  }`} />
                  <span className="text-white">{activity.action}</span>
                </div>
                <span className="text-dark-400 text-sm">{activity.time}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-dark-800 rounded-xl p-6 border border-dark-700"
        >
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <SafeIcon icon={FiTrendingUp} className="w-5 h-5 mr-2 text-primary-400" />
            System Status
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-white">AI Analysis Engine</span>
              <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white">Docker Service</span>
              <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">Running</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white">GitHub Integration</span>
              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
                {state.githubToken ? 'Connected' : 'Pending'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white">Code Analyzer</span>
              <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">Ready</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* New Feature Highlight */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-primary-900/30 to-primary-800/20 rounded-xl p-6 border border-primary-700/30"
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold text-white mb-2 flex items-center">
              <SafeIcon icon={FiCode} className="w-5 h-5 mr-2 text-primary-400" />
              New: AI-Powered Code Analysis
            </h3>
            <p className="text-dark-300 mb-4">
              Our new code analyzer uses OpenAI to detect bugs, suggest improvements, and enhance code quality.
              Analyze your project files with a powerful AI assistant to receive instant feedback.
            </p>
            <Link
              to="/code-analyzer"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 inline-flex items-center space-x-2 transition-all duration-200"
            >
              <SafeIcon icon={FiCode} className="w-4 h-4" />
              <span>Try Code Analyzer</span>
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 rounded-full bg-primary-500/20 flex items-center justify-center">
              <SafeIcon icon={FiCode} className="w-12 h-12 text-primary-400" />
            </div>
          </div>
        </div>
      </motion.div>

      {state.currentProject && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-dark-800 rounded-xl p-6 border border-dark-700"
        >
          <h3 className="text-xl font-semibold text-white mb-4">Current Project</h3>
          <div className="bg-dark-700 rounded-lg p-4">
            <h4 className="text-lg font-medium text-white mb-2">{state.currentProject.name}</h4>
            <p className="text-dark-300 mb-3">{state.currentProject.description}</p>
            <div className="flex flex-wrap gap-2">
              {state.techStack?.frameworks?.map((framework, index) => (
                <span key={index} className="px-2 py-1 bg-primary-500/20 text-primary-400 rounded text-xs">
                  {framework}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;