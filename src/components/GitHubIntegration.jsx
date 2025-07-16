import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useProject } from '../context/ProjectContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import axios from 'axios';

const { 
  FiGithub, FiKey, FiUpload, FiCheck, FiX, FiSettings, 
  FiUser, FiRepo, FiAlertCircle, FiCode, FiDownload, 
  FiGitBranch, FiFolder, FiBox, FiLock, FiUnlock, FiFile
} = FiIcons;

const GitHubIntegration = () => {
  const { state, dispatch } = useProject();
  const [localToken, setLocalToken] = useState(state.githubToken || '');
  const [repoName, setRepoName] = useState('');
  const [repoDescription, setRepoDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [tokenError, setTokenError] = useState(null);
  const [repoFiles, setRepoFiles] = useState([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [pushType, setPushType] = useState('full'); // Default to full project
  const [isCreatingRepo, setIsCreatingRepo] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [projectFiles, setProjectFiles] = useState([]);
  const [isLoadingProjectFiles, setIsLoadingProjectFiles] = useState(false);

  // Validate GitHub token and get user info
  const validateToken = async (token) => {
    try {
      const response = await axios.get('https://api.github.com/user', {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      
      setUserInfo(response.data);
      setTokenError(null);
      dispatch({ type: 'SET_GITHUB_TOKEN', payload: token });
      return true;
    } catch (error) {
      setTokenError(error.response?.data?.message || 'Invalid token');
      setUserInfo(null);
      return false;
    }
  };

  // Handle token save
  const handleTokenSave = async () => {
    if (!localToken) {
      setTokenError('Please enter a GitHub token');
      return;
    }
    
    await validateToken(localToken);
  };

  // Auto-validate token on component mount
  useEffect(() => {
    if (localToken) {
      validateToken(localToken);
    }
  }, []);

  // Fetch project files if project is selected
  const fetchProjectFiles = async () => {
    if (!state.currentProject) return [];
    
    setIsLoadingProjectFiles(true);
    
    try {
      // If we have a GitHub URL, fetch the project structure
      if (state.repoUrl && state.currentProject.owner && state.currentProject.repo) {
        dispatch({ type: 'ADD_LOG', payload: { type: 'info', message: 'Fetching project files...' } });
        
        // Recursively fetch all files in the repository
        const files = await fetchRepositoryFiles(
          state.currentProject.owner,
          state.currentProject.repo, 
          state.currentProject.branch || 'main'
        );
        
        setProjectFiles(files);
        return files;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching project files:', error);
      dispatch({ type: 'ADD_LOG', payload: { type: 'error', message: `Error fetching project files: ${error.message}` } });
      return [];
    } finally {
      setIsLoadingProjectFiles(false);
    }
  };

  // Recursively fetch all files in a repository
  const fetchRepositoryFiles = async (owner, repo, branch, path = '') => {
    try {
      const url = path 
        ? `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`
        : `https://api.github.com/repos/${owner}/${repo}/contents?ref=${branch}`;
        
      const response = await axios.get(url, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          ...(localToken ? { 'Authorization': `token ${localToken}` } : {})
        }
      });
      
      let files = [];
      
      for (const item of response.data) {
        if (item.type === 'file') {
          // Skip large files and binary files
          if (item.size > 1000000 || isBinaryFilename(item.name)) {
            console.log(`Skipping large or binary file: ${item.path} (${item.size} bytes)`);
            continue;
          }
          
          // Fetch file content
          const contentResponse = await axios.get(item.download_url);
          
          files.push({
            path: item.path,
            content: contentResponse.data,
            type: getFileType(item.name),
            size: item.size
          });
          
        } else if (item.type === 'dir') {
          // Skip node_modules and other large directories
          if (['node_modules', '.git', 'dist', 'build', 'coverage'].includes(item.name)) {
            continue;
          }
          
          // Recursively fetch files in subdirectories
          const subFiles = await fetchRepositoryFiles(owner, repo, branch, item.path);
          files = [...files, ...subFiles];
        }
      }
      
      return files;
    } catch (error) {
      console.error(`Error fetching files at ${path}:`, error);
      return [];
    }
  };

  // Check if filename is likely a binary file
  const isBinaryFilename = (filename) => {
    const binaryExtensions = [
      '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.ico', '.svg',
      '.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx',
      '.zip', '.tar', '.gz', '.rar', '.7z',
      '.exe', '.dll', '.so', '.dylib',
      '.mp3', '.mp4', '.avi', '.mov', '.webm',
      '.ttf', '.woff', '.woff2', '.eot'
    ];
    
    return binaryExtensions.some(ext => filename.toLowerCase().endsWith(ext));
  };

  // Get file type based on filename
  const getFileType = (filename) => {
    if (filename === 'Dockerfile') return 'dockerfile';
    if (filename === 'docker-compose.yml' || filename === 'docker-compose.yaml') return 'compose';
    if (filename === '.dockerignore') return 'dockerignore';
    if (filename.toLowerCase() === 'readme.md') return 'readme';
    if (filename.endsWith('.js') || filename.endsWith('.jsx')) return 'javascript';
    if (filename.endsWith('.ts') || filename.endsWith('.tsx')) return 'typescript';
    if (filename.endsWith('.css') || filename.endsWith('.scss') || filename.endsWith('.sass')) return 'style';
    if (filename.endsWith('.html')) return 'html';
    if (filename.endsWith('.json')) return 'json';
    if (filename.endsWith('.md')) return 'markdown';
    if (filename.endsWith('.py')) return 'python';
    if (filename.endsWith('.rb')) return 'ruby';
    if (filename.endsWith('.php')) return 'php';
    if (filename.endsWith('.java')) return 'java';
    if (filename.endsWith('.go')) return 'go';
    return 'file';
  };

  // Generate repository files based on current project
  const generateRepositoryFiles = () => {
    let files = [];
    
    // Always include these core files
    if (state.dockerfile) {
      files.push({
        path: 'Dockerfile',
        content: state.dockerfile,
        type: 'dockerfile'
      });
      
      // Add .dockerignore
      const dockerignoreContent = `node_modules
npm-debug.log
*.log
.git
.gitignore
.env
.nyc_output
coverage
.vscode
dist
build
*.md
!README.md
`;
      
      files.push({
        path: '.dockerignore',
        content: dockerignoreContent,
        type: 'dockerignore'
      });
      
      // Add docker-compose.yml
      const dockerComposeContent = `version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
`;
      
      files.push({
        path: 'docker-compose.yml',
        content: dockerComposeContent,
        type: 'compose'
      });
    }
    
    // Add README.md
    if (state.currentProject) {
      const readmeContent = `# ${state.currentProject.name}

${state.currentProject.description || 'A containerized application'}

## Tech Stack
- **Language**: ${state.techStack?.language || 'Unknown'}
- **Frameworks**: ${state.techStack?.frameworks?.join(', ') || 'None'}
- **Databases**: ${state.techStack?.databases?.join(', ') || 'None'}
- **Tools**: ${state.techStack?.tools?.join(', ') || 'None'}

## Dependencies
${state.dependencies.map(dep => `- ${dep.name}@${dep.version} (${dep.type})`).join('\n')}

## Docker Usage

Build the image:
\`\`\`bash
docker build -t ${state.currentProject.name.toLowerCase()} .
\`\`\`

Run the container:
\`\`\`bash
docker run -p 3000:3000 ${state.currentProject.name.toLowerCase()}
\`\`\`

## Development

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev
\`\`\`

---
*Generated by Agentic AI System*
`;
      
      files.push({
        path: 'README.md',
        content: readmeContent,
        type: 'readme'
      });
    }
    
    // If pushing full project, include all project files
    if (pushType === 'full' && projectFiles.length > 0) {
      // Add all project files, but skip files we've already added
      const existingPaths = files.map(file => file.path);
      
      for (const file of projectFiles) {
        if (!existingPaths.includes(file.path)) {
          files.push(file);
        }
      }
    }
    
    return files;
  };

  // Create GitHub repository
  const createRepository = async () => {
    if (!userInfo || !repoName) {
      dispatch({ type: 'SET_ERROR', payload: 'Please enter a repository name' });
      return;
    }
    
    setIsCreatingRepo(true);
    dispatch({ type: 'CLEAR_LOGS' });
    dispatch({ type: 'ADD_LOG', payload: { type: 'info', message: 'Creating GitHub repository...' } });
    
    try {
      const response = await axios.post('https://api.github.com/user/repos', {
        name: repoName,
        description: repoDescription || `Generated by Agentic AI System for ${state.currentProject?.name || 'project'}`,
        private: isPrivate,
        auto_init: false
      }, {
        headers: {
          'Authorization': `token ${localToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      
      dispatch({ type: 'ADD_LOG', payload: { type: 'success', message: `Repository '${repoName}' created successfully!` } });
      
      // Now push files
      await pushFilesToRepo(response.data);
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      dispatch({ type: 'ADD_LOG', payload: { type: 'error', message: `Error creating repository: ${errorMessage}` } });
    } finally {
      setIsCreatingRepo(false);
    }
  };

  // Push files to repository
  const pushFilesToRepo = async (repoData) => {
    setIsPushing(true);
    const files = generateRepositoryFiles();
    
    if (files.length === 0) {
      dispatch({ type: 'SET_ERROR', payload: 'No files to push' });
      setIsPushing(false);
      return;
    }
    
    try {
      dispatch({ type: 'ADD_LOG', payload: { type: 'info', message: `Pushing ${files.length} files to repository...` } });
      
      // Create files one by one
      for (const file of files) {
        dispatch({ type: 'ADD_LOG', payload: { type: 'info', message: `Creating ${file.path}...` } });
        
        try {
          // For text files, we need to encode content
          const content = typeof file.content === 'string' 
            ? btoa(unescape(encodeURIComponent(file.content))) // Base64 encode text
            : btoa(String.fromCharCode.apply(null, new Uint8Array(file.content))); // Binary content
          
          await axios.put(`https://api.github.com/repos/${userInfo.login}/${repoName}/contents/${file.path}`, {
            message: `Add ${file.path}`,
            content: content,
            branch: 'main'
          }, {
            headers: {
              'Authorization': `token ${localToken}`,
              'Accept': 'application/vnd.github.v3+json'
            }
          });
          
          dispatch({ type: 'ADD_LOG', payload: { type: 'success', message: `✓ ${file.path} created successfully` } });
        } catch (error) {
          dispatch({ type: 'ADD_LOG', payload: { type: 'error', message: `Error pushing ${file.path}: ${error.message}` } });
          console.error(`Error pushing ${file.path}:`, error);
          // Continue with other files
        }
      }
      
      dispatch({ type: 'ADD_LOG', payload: { type: 'success', message: 'Repository files pushed successfully!' } });
      dispatch({ type: 'ADD_LOG', payload: { type: 'info', message: `Repository URL: ${repoData.html_url}` } });
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      dispatch({ type: 'ADD_LOG', payload: { type: 'error', message: `Error pushing files: ${errorMessage}` } });
    } finally {
      setIsPushing(false);
    }
  };

  // Load repository files for preview
  useEffect(() => {
    if (state.currentProject || state.dockerfile) {
      setIsLoadingFiles(true);
      
      // If pushing full project and we don't have project files yet, fetch them
      if (pushType === 'full' && projectFiles.length === 0 && state.currentProject) {
        fetchProjectFiles().then(files => {
          const allFiles = generateRepositoryFiles();
          setRepoFiles(allFiles);
          setIsLoadingFiles(false);
        });
      } else {
        const files = generateRepositoryFiles();
        setRepoFiles(files);
        setIsLoadingFiles(false);
      }
    }
  }, [state.currentProject, state.dockerfile, pushType, projectFiles]);

  // Auto-fill repository name from current project
  useEffect(() => {
    if (state.currentProject && !repoName) {
      setRepoName(`${state.currentProject.name}-docker`);
      setRepoDescription(`Dockerized ${state.currentProject.name} - Generated by Agentic AI System`);
    }
  }, [state.currentProject]);

  // Fetch project files when component mounts
  useEffect(() => {
    if (state.currentProject) {
      fetchProjectFiles();
    }
  }, [state.currentProject]);

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-white mb-4">GitHub Integration</h1>
        <p className="text-dark-300">Push your complete project with Dockerfile to GitHub</p>
      </motion.div>

      {/* GitHub Token Configuration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-dark-800 rounded-xl p-6 border border-dark-700"
      >
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <SafeIcon icon={FiKey} className="w-5 h-5 mr-2 text-primary-400" />
          GitHub Token
        </h3>
        
        {!userInfo ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-400 mb-2">
                Personal Access Token
              </label>
              <input
                type="password"
                value={localToken}
                onChange={(e) => setLocalToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full px-4 py-3 bg-dark-700 text-white rounded-lg border border-dark-600 focus:border-primary-500 focus:outline-none"
              />
              {tokenError && (
                <p className="text-red-400 text-sm mt-2 flex items-center">
                  <SafeIcon icon={FiAlertCircle} className="w-4 h-4 mr-1" />
                  {tokenError}
                </p>
              )}
            </div>
            
            <div className="bg-dark-700 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2">How to get a GitHub Token:</h4>
              <ol className="text-dark-300 text-sm space-y-1 list-decimal list-inside">
                <li>Go to GitHub Settings → Developer settings → Personal access tokens</li>
                <li>Click "Generate new token (classic)"</li>
                <li>Select scopes: <code className="bg-dark-600 px-1 rounded">repo</code> and <code className="bg-dark-600 px-1 rounded">user</code></li>
                <li>Copy the generated token</li>
              </ol>
            </div>
            
            <button
              onClick={handleTokenSave}
              disabled={!localToken}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Validate Token
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="flex items-center space-x-3">
              <SafeIcon icon={FiCheck} className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-white font-medium">Connected as {userInfo.login}</p>
                <p className="text-dark-300 text-sm">{userInfo.name || 'No name set'}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setUserInfo(null);
                setLocalToken('');
                dispatch({ type: 'SET_GITHUB_TOKEN', payload: '' });
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200"
            >
              Disconnect
            </button>
          </div>
        )}
      </motion.div>

      {/* Repository Creation */}
      {userInfo && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-dark-800 rounded-xl p-6 border border-dark-700"
        >
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <SafeIcon icon={FiRepo} className="w-5 h-5 mr-2 text-primary-400" />
            Create Repository
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-400 mb-2">
                  Repository Name
                </label>
                <input
                  type="text"
                  value={repoName}
                  onChange={(e) => setRepoName(e.target.value)}
                  placeholder="my-docker-project"
                  className="w-full px-4 py-3 bg-dark-700 text-white rounded-lg border border-dark-600 focus:border-primary-500 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-dark-400 mb-2">
                  Description
                </label>
                <textarea
                  value={repoDescription}
                  onChange={(e) => setRepoDescription(e.target.value)}
                  placeholder="Project description..."
                  rows={3}
                  className="w-full px-4 py-3 bg-dark-700 text-white rounded-lg border border-dark-600 focus:border-primary-500 focus:outline-none resize-none"
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="pushType"
                    value="dockerfile"
                    checked={pushType === 'dockerfile'}
                    onChange={(e) => setPushType(e.target.value)}
                    className="text-primary-600"
                  />
                  <span className="text-white">Docker Files Only</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="pushType"
                    value="full"
                    checked={pushType === 'full'}
                    onChange={(e) => setPushType(e.target.value)}
                    className="text-primary-600"
                  />
                  <span className="text-white">Complete Project</span>
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="private"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="private" className="text-white flex items-center space-x-2">
                  <SafeIcon icon={isPrivate ? FiLock : FiUnlock} className="w-4 h-4" />
                  <span>Private Repository</span>
                </label>
              </div>
              
              <button
                onClick={createRepository}
                disabled={!repoName || isCreatingRepo || isPushing || isLoadingProjectFiles}
                className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-all duration-200"
              >
                {isCreatingRepo || isPushing || isLoadingProjectFiles ? (
                  <>
                    <SafeIcon icon={FiUpload} className="w-4 h-4 animate-spin" />
                    <span>
                      {isLoadingProjectFiles 
                        ? 'Loading Project Files...' 
                        : isCreatingRepo 
                          ? 'Creating Repository...' 
                          : 'Pushing Files...'}
                    </span>
                  </>
                ) : (
                  <>
                    <SafeIcon icon={FiGithub} className="w-4 h-4" />
                    <span>Create Repository & Push Files</span>
                  </>
                )}
              </button>
            </div>
            
            <div>
              <h4 className="text-white font-medium mb-3">
                Files to Push ({repoFiles.length})
                {isLoadingFiles && <span className="text-dark-400 text-sm ml-2">(Loading...)</span>}
              </h4>
              
              <div className="bg-dark-700 rounded-lg p-4 max-h-64 overflow-y-auto">
                {isLoadingFiles ? (
                  <div className="text-dark-400 text-center py-4 flex items-center justify-center">
                    <SafeIcon icon={FiUpload} className="w-4 h-4 animate-spin mr-2" />
                    <span>Loading files...</span>
                  </div>
                ) : repoFiles.length > 0 ? (
                  <div className="space-y-2">
                    {repoFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-dark-600 rounded">
                        <div className="flex items-center space-x-2">
                          <SafeIcon 
                            icon={
                              file.type === 'dockerfile' ? FiBox : 
                              file.type === 'compose' ? FiBox :
                              file.type === 'readme' ? FiCode : 
                              file.type === 'javascript' ? FiCode :
                              file.type === 'typescript' ? FiCode :
                              file.type === 'style' ? FiCode :
                              file.type === 'html' ? FiCode :
                              file.type === 'json' ? FiCode :
                              FiFile
                            } 
                            className="w-4 h-4 text-primary-400" 
                          />
                          <span className="text-white text-sm truncate max-w-[180px]">{file.path}</span>
                        </div>
                        <span className="text-dark-400 text-xs">
                          {file.size 
                            ? `${Math.round(file.size / 1024)}KB` 
                            : `${Math.round((file.content?.length || 0) / 1024)}KB`}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-dark-400 text-center py-4">
                    {state.currentProject ? (
                      pushType === 'full' ? (
                        <div>
                          <SafeIcon icon={FiGitBranch} className="w-10 h-10 mx-auto mb-2 text-dark-500" />
                          <p>Loading project files...</p>
                        </div>
                      ) : (
                        <div>
                          <SafeIcon icon={FiBox} className="w-10 h-10 mx-auto mb-2 text-dark-500" />
                          <p>Generate a Dockerfile first</p>
                        </div>
                      )
                    ) : (
                      <div>
                        <SafeIcon icon={FiGitBranch} className="w-10 h-10 mx-auto mb-2 text-dark-500" />
                        <p>Analyze a project first</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {pushType === 'full' && (
                <div className="mt-4 bg-blue-500/10 text-blue-400 p-3 rounded-lg text-sm">
                  <div className="flex items-center space-x-2">
                    <SafeIcon icon={FiInfo} className="w-5 h-5 flex-shrink-0" />
                    <p>
                      Complete project push will include all source files, Docker configuration, 
                      and a generated README with setup instructions.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Logs */}
      {state.logs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-dark-800 rounded-xl p-6 border border-dark-700"
        >
          <h3 className="text-xl font-semibold text-white mb-4">Push Logs</h3>
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
    </div>
  );
};

// Import FiInfo icon since it's used in the component
const FiInfo = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

export default GitHubIntegration;