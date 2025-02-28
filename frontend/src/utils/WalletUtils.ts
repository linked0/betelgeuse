export const shotAddress = (address: String): string => {
  if (address) return `${address.slice(0, 6)}...${address.slice(-4)}`;
};
export const firstAddress = (address: String): string => {
  if (address) return `${address.substring(2, 8)}`;
};
export const isValidAddress = (address: string) => {
  if (!/^(0x)?[0-9a-fA-F]{40}$/.test(address)) {
    return false;
  } else if (/^(0x)?[0-9a-fA-F]{40}$/.test(address) || /^(0x)?[0-9A-Fa-f]{40}$/.test(address)) {
    return true;
  } else {
    return false;
  }
};
