export const NEW_GROUP = 'new_group';

export const isNewGroup = (groupId: string): boolean => groupId === NEW_GROUP;

export const isArrEmpty = <T>(arr: Array<T>): boolean => arr.length === 0;

export const removeElementAtIndex = <T>(arr: T[], index: number): T[] => {
  if (index < 0 || index >= arr.length) {
    throw new Error('Index out of bounds');
  }

  return [...arr.slice(0, index), ...arr.slice(index + 1)];
}