/**
 * buildNode
 * Assemble DOM element based on definition object
 * @param {object} nodeInfo
 * @returns {element}
 */
export const buildNode = nodeInfo => {
  const builtNode = document.createElement(nodeInfo.type);
  nodeInfo.classes &&
    nodeInfo.classes.forEach(entry => {
      builtNode.classList.add(entry);
    });
  nodeInfo.attr &&
    nodeInfo.attr.forEach(entry => {
      builtNode.setAttribute(entry.name, entry.value);
    });
  nodeInfo.innerHTML && (builtNode.innerHTML = nodeInfo.innerHTML);
  nodeInfo.childElement && nodeInfo.childElement.forEach(el => builtNode.appendChild(el));
  nodeInfo.element = builtNode;
  return builtNode;
};
