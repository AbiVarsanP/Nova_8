import React, { createContext, useContext, useReducer } from 'react';

const ProjectContext = createContext();

const initialState = {
  currentProject: null,
  repoUrl: '',
  techStack: null,
  dependencies: [],
  dockerfile: '',
  testResults: null,
  githubToken: '',
  isAnalyzing: false,
  isGenerating: false,
  isTesting: false,
  isDeploying: false,
  logs: [],
  error: null,
  openaiKey: '',
  codeAnalysisResults: null
};

function projectReducer(state, action) {
  switch (action.type) {
    case 'SET_REPO_URL':
      return { ...state, repoUrl: action.payload };
    case 'SET_CURRENT_PROJECT':
      return { ...state, currentProject: action.payload };
    case 'SET_TECH_STACK':
      return { ...state, techStack: action.payload };
    case 'SET_DEPENDENCIES':
      return { ...state, dependencies: action.payload };
    case 'SET_DOCKERFILE':
      return { ...state, dockerfile: action.payload };
    case 'SET_TEST_RESULTS':
      return { ...state, testResults: action.payload };
    case 'SET_GITHUB_TOKEN':
      return { ...state, githubToken: action.payload };
    case 'SET_OPENAI_KEY':
      return { ...state, openaiKey: action.payload };
    case 'SET_CODE_ANALYSIS_RESULTS':
      return { ...state, codeAnalysisResults: action.payload };
    case 'SET_ANALYZING':
      return { ...state, isAnalyzing: action.payload };
    case 'SET_GENERATING':
      return { ...state, isGenerating: action.payload };
    case 'SET_TESTING':
      return { ...state, isTesting: action.payload };
    case 'SET_DEPLOYING':
      return { ...state, isDeploying: action.payload };
    case 'ADD_LOG':
      return { ...state, logs: [...state.logs, action.payload] };
    case 'CLEAR_LOGS':
      return { ...state, logs: [] };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'RESET_PROJECT':
      return initialState;
    default:
      return state;
  }
}

export const ProjectProvider = ({ children }) => {
  const [state, dispatch] = useReducer(projectReducer, initialState);
  
  return (
    <ProjectContext.Provider value={{ state, dispatch }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};