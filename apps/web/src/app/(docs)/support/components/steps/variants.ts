export const stepVariants = {
  enter: {
    opacity: 0,
    x: 20
  },
  center: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3
    }
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: {
      duration: 0.3
    }
  }
};

export const formContainerVariants = {
  hidden: {
    opacity: 0,
    y: 20
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
};
