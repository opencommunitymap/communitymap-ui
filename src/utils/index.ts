export const reportError = (err: Error, silent = false) => {
  console.error(err);
  if (!silent) alert(err.message);
};

export const directMessageId = (me: string, other: string) => {
  return me < other ? `${me}-${other}` : `${other}-${me}`;
};
