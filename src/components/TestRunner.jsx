import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useProject } from '../context/ProjectContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiPlay, FiCheck, FiX, FiClock, FiTerminal, FiBox, FiServer } = FiIcons;

const TestRunner = () => {
  const { state, dispatch } = useProject();
  const [testType, setTestType] = useState('build');

  const runTests = async () => {
    if (!state.dockerfile) {
      dispatch({ type: 'SET_ERROR', payload: 'Please generate a Dockerfile first' });
      return;
    }

    dispatch({ type: 'SET_TESTING', payload: true });
    dispatch({ type: 'CLEAR_LOGS' });

    try {
      // Simulate Docker build test
      dispatch({ type: 'ADD_LOG', payload: { type: 'info', message: 'Starting Docker build test...' } });
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      dispatch({ type: 'ADD_LOG', payload: { type: 'info', message: 'Building Docker image...' } });
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      dispatch({ type: 'ADD_LOG', payload: { type: 'success', message: 'Docker image built successfully!' } });
      
      if (testType === 'run') {
        dispatch({ type: 'ADD_LOG', payload: { type: 'info', message: 'Starting container...' } });
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        dispatch({ type: 'ADD_LOG', payload: { type: 'info', message: 'Container started on port 3000' } });
        dispatch({ type: 'ADD_LOG', payload: { type: 'info', message: 'Running health checks...' } });
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        dispatch({ type: 'ADD_LOG', payload: { type: 'success', message: 'Health checks passed!' } });
      }

      const testResults = {
        status: 'passed',
        buildTime: '45s',
        imageSize: '234MB',
        vulnerabilities: 0,
        tests: [
          { name: 'Docker Build', status: 'passed', duration: '45s' },
          { name: 'Image Security Scan', status: 'passed', duration: '12s' },
          { name: 'Container Start', status: testType === 'run' ? 'passed' : 'skipped', duration: '8s' },
          { name: 'Health Check', status: testType === 'run' ? 'passed' : 'skipped', duration: '3s' }
        ]
      };

      dispatch({ type: 'SET_TEST_RESULTS', payload: testResults });
      dispatch({ type: 'ADD_LOG', payload: { type: 'success', message: 'All tests completed successfully!' } });

    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      dispatch({ type: 'ADD_LOG', payload: { type: 'error', message: `Error: ${error.message}` } });
    } finally {
      dispatch({ type: 'SET_TESTING', payload: false });
    }
  };

  if (!state.dockerfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 text-center">
        <SafeIcon icon={FiPlay} className="w-16 h-16 text-dark-500 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">No Dockerfile Available</h2>
        <p className="text-dark-400 mb-6">Please generate a Dockerfile first to run tests</p>
        <button
          onClick={() => window.location.hash = '/dockerfile'}
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-200"
        >
          Generate Dockerfile
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-white mb-4">Test Runner</h1>
        <p className="text-dark-300">Test your Docker configuration and deployment</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-dark-800 rounded-xl p-6 border border-dark-700"
      >
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <SafeIcon icon={FiTerminal} className="w-5 h-5 mr-2 text-primary-400" />
          Test Configuration
        </h3>
        
        <div className="flex items-center space-x-4 mb-6">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="testType"
              value="build"
              checked={testType === 'build'}
              onChange={(e) => setTestType(e.target.value)}
              className="text-primary-600"
            />
            <span className="text-white">Build Test Only</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="testType"
              value="run"
              checked={testType === 'run'}
              onChange={(e) => setTestType(e.target.value)}
              className="text-primary-600"
            />
            <span className="text-white">Build & Run Test</span>
          </label>
        </div>

        <button
          onClick={runTests}
          disabled={state.isTesting}
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all duration-200"
        >
          {state.isTesting ? (
            <>
              <SafeIcon icon={FiClock} className="w-4 h-4 animate-spin" />
              <span>Testing...</span>
            </>
          ) : (
            <>
              <SafeIcon icon={FiPlay} className="w-4 h-4" />
              <span>Run Tests</span>
            </>
          )}
        </button>
      </motion.div>

      {state.logs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-dark-800 rounded-xl p-6 border border-dark-700"
        >
          <h3 className="text-xl font-semibold text-white mb-4">Test Logs</h3>
          <div className="bg-dark-900 rounded-lg p-4 font-mono text-sm max-h-64 overflow-y-auto">
            {state.logs.map((log, index) => (
              <div key={index} className={`mb-2 ${
                log.type === 'error' ? 'text-red-400' : 
                log.type === 'success' ? 'text-green-400' : 
                'text-dark-300'
              }`}>
                <span className="text-dark-500">[{new Date().toLocaleTimeString()}]</span> {log.message}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {state.testResults && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-dark-800 rounded-xl p-6 border border-dark-700"
        >
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <SafeIcon icon={FiCheck} className="w-5 h-5 mr-2 text-green-400" />
            Test Results
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-dark-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <SafeIcon icon={FiClock} className="w-4 h-4 text-blue-400" />
                <span className="text-dark-400">Build Time</span>
              </div>
              <span className="text-white text-lg font-semibold">{state.testResults.buildTime}</span>
            </div>
            
            <div className="bg-dark-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <SafeIcon icon={FiBox} className="w-4 h-4 text-purple-400" />
                <span className="text-dark-400">Image Size</span>
              </div>
              <span className="text-white text-lg font-semibold">{state.testResults.imageSize}</span>
            </div>
            
            <div className="bg-dark-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <SafeIcon icon={FiServer} className="w-4 h-4 text-green-400" />
                <span className="text-dark-400">Vulnerabilities</span>
              </div>
              <span className="text-white text-lg font-semibold">{state.testResults.vulnerabilities}</span>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-lg font-medium text-white">Test Details</h4>
            {state.testResults.tests.map((test, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-dark-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <SafeIcon 
                    icon={test.status === 'passed' ? FiCheck : test.status === 'failed' ? FiX : FiClock}
                    className={`w-4 h-4 ${
                      test.status === 'passed' ? 'text-green-400' : 
                      test.status === 'failed' ? 'text-red-400' : 
                      'text-yellow-400'
                    }`}
                  />
                  <span className="text-white">{test.name}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-dark-400 text-sm">{test.duration}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    test.status === 'passed' ? 'bg-green-500/20 text-green-400' :
                    test.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {test.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default TestRunner;