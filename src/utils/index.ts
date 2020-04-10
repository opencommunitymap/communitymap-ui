export const reportError = (err: Error) => {
  console.error(err);
  alert(err.message);
};
