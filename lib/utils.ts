export const formatPascal = (str: string) => {
  str = str.replaceAll("_", " ");
  const firstLetter = str.charAt(0).toUpperCase();
  return firstLetter + str.slice(1);
};
