import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import Dashboard from './components/Dashboard';
import ProjectAnalyzer from './components/ProjectAnalyzer';
import DockerfileGenerator from './components/DockerfileGenerator';
import TestRunner from './components/TestRunner';
import GitHubIntegration from './components/GitHubIntegration';
import CodeAnalyzer from './components/CodeAnalyzer';
import Navigation from './components/Navigation';
import { ProjectProvider } from './context/ProjectContext';

function App() {
  return (
    <ProjectProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
          <Navigation />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/analyze" element={<ProjectAnalyzer />} />
              <Route path="/dockerfile" element={<DockerfileGenerator />} />
              <Route path="/test" element={<TestRunner />} />
              <Route path="/github" element={<GitHubIntegration />} />
              <Route path="/code-analyzer" element={<CodeAnalyzer />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ProjectProvider>
  );
}

export default App;