export const reportError = (err: Error) => {
  console.error(err);
  alert(err.message);
};

export const directMessageId = (me: string, other: string) => {
  return me < other ? `${me}-${other}` : `${other}-${me}`;
};
