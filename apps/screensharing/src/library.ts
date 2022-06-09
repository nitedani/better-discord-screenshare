let library: Library | null = null;

export const setLibrary = (lib: Library) => {
  library = lib;
};

export const getLibrary = () => {
  return library;
};
