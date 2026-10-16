const parseNameValuePairs = (
  flag: string,
  pairs: (string | number)[],
): { name: string; value: string }[] =>
  pairs.map(pair => {
    const [name, ...rest] = String(pair).split('=');
    if (!name || !rest.length)
      throw new Error(`Invalid --${flag} "${pair}", expected name=value.`);
    return { name, value: rest.join('=') };
  });

export { parseNameValuePairs };
