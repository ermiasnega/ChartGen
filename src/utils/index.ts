// General utilities

export const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ');
};

export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};
