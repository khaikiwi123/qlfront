const sortedName = (a, b) => {
  const aNameParts = a.name.split(" ");
  const bNameParts = b.name.split(" ");

  const aLast = aNameParts[0];
  const aFirst = aNameParts[aNameParts.length - 1];
  const aMiddle = aNameParts.slice(1, -1).join(" ");

  const bLast = bNameParts[0];
  const bFirst = bNameParts[bNameParts.length - 1];
  const bMiddle = bNameParts.slice(1, -1).join(" ");

  if (aFirst < bFirst) return -1;
  if (aFirst > bFirst) return 1;

  if (aLast < bLast) return -1;
  if (aLast > bLast) return 1;

  if (aMiddle < bMiddle) return -1;
  if (aMiddle > bMiddle) return 1;

  return 0;
};

export default sortedName;
