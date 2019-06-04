export const getFileText = async path => {
  const response = await fetch(path);
  return await response.text();
};
