module.exports = function (fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  const oldNamespace = '@ephox/';
  const newNamespace = '@hugerte/';

  // Packages to exclude from replacement
  const excludePackages = [
    'bedrock-client',
    'bedrock-server',
    'bedrock-common',
    'swag',
    'dispute',
    'oxide-icons-tools',
  ];

  root
    .find(j.ImportDeclaration)
    .filter((path) => path.node.source.value.startsWith(oldNamespace))
    .forEach((path) => {
      const importPath = path.node.source.value;
      const packageName = importPath.replace(oldNamespace, ''); // Extract package name

      // Replace only if not in the exclusion list
      if (!excludePackages.includes(packageName)) {
        path.node.source.value = importPath.replace(oldNamespace, newNamespace);
      }
    });

  return root.toSource();
};
