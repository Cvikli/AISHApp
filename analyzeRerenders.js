const fs = require('fs');
const path = require('path');

function extractDependencies(content) {
  const useEffectRegex = /useEffect\(\s*\(\)\s*=>\s*{[\s\S]*?},\s*\[([\s\S]*?)\]\)/g;
  const useCallbackRegex = /useCallback\(\s*\(([\s\S]*?)\)\s*=>\s*{[\s\S]*?},\s*\[([\s\S]*?)\]\)/g;
  const useMemoRegex = /useMemo\(\s*\(\)\s*=>\s*{[\s\S]*?},\s*\[([\s\S]*?)\]\)/g;

  const dependencies = new Set();

  let match;
  while ((match = useEffectRegex.exec(content)) !== null) {
    match[1].split(',').forEach(dep => dependencies.add(dep.trim()));
  }
  while ((match = useCallbackRegex.exec(content)) !== null) {
    match[2].split(',').forEach(dep => dependencies.add(dep.trim()));
  }
  while ((match = useMemoRegex.exec(content)) !== null) {
    match[1].split(',').forEach(dep => dependencies.add(dep.trim()));
  }

  return Array.from(dependencies).filter(dep => dep !== '');
}

function analyzeComponent(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const componentName = path.basename(filePath, '.js');
  const dependencies = extractDependencies(content);

  return {
    name: componentName,
    dependencies,
  };
}

function analyzeComponents(directory) {
  const components = [];
  const files = fs.readdirSync(directory);

  files.forEach(file => {
    if (file.endsWith('.js') && !file.endsWith('.test.js')) {
      const filePath = path.join(directory, file);
      components.push(analyzeComponent(filePath));
    }
  });

  return components;
}

function generateDependencyGraph(components) {
  const graph = {};

  components.forEach(component => {
    graph[component.name] = component.dependencies;
  });

  return graph;
}

const componentsDir = path.join(__dirname, 'components');
const components = analyzeComponents(componentsDir);
const dependencyGraph = generateDependencyGraph(components);

console.log(JSON.stringify(dependencyGraph, null, 2));
