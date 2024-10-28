import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { isNewGroup, removeElementAtIndex } from 'Frontend/utils';
import React from 'react';
import { create } from 'zustand';

type RummyStore = {
  cards: string[][]; // 2D array of card strings
  setInitialCards: (hand: Array<string>) => void;
  addGroup: () => void;
  addCardToGroup: (groupIndex: number, card: string) => void;
  moveCardBetweenGroups: (
    fromGroupIndex: number,
    toGroupIndex: number,
    cardIndex: number
  ) => void;
  moveCardWithinGroup: (
    groupIndex: number,
    oldIndex: number,
    newIndex: number
  ) => void;
};

export const useRummyStore = create<RummyStore>((set) => ({
  cards: [[]], // Initialize with one empty group
  setInitialCards: (hand: Array<string>) =>
    set((_state) => ({ cards: [[...hand]] })),
  addGroup: () =>
    set((state) => ({
      cards: [...state.cards, []],
    })),
  addCardToGroup: (groupIndex, card) =>
    set((state) => {
      const newcards = [...state.cards];
      newcards[groupIndex].push(card);
      return { cards: newcards };
    }),
  moveCardBetweenGroups: (fromGroupIndex, toGroupIndex, cardIndex) =>
    set((state) => {
      const newcards = [...state.cards];
      const [movedCard] = newcards[fromGroupIndex].splice(
        cardIndex,
        1
      ); // Remove the card from the original group
      newcards[toGroupIndex].push(movedCard); // Add the card to the new group
      return { cards: newcards };
    }),
  moveCardWithinGroup: (groupIndex, oldIndex, newIndex) =>
    set((state) => {
      const newcards = [...state.cards];
      const group = [...newcards[groupIndex]];
      const [movedCard] = group.splice(oldIndex, 1); // Remove card
      group.splice(newIndex, 0, movedCard); // Add card at new position
      newcards[groupIndex] = group; // Update the group
      return { cards: newcards };
    }),
}));

// interface RummyStore {
//   cards: Array<Array<string>>;
//   setInitialCards: (hand: Array<string>) => void;
//   addToGroup: (
//     card: string,
//     toGroupIdx: string,
//     fromGroupId: string
//   ) => void;
//   reorderCardInGroup: (
//     groupIndex: string,
//     fromIndex: number,
//     toIndex: number
//   ) => void;
// }

// export const useRummyStore = create<RummyStore>((set) => ({
//   cards: [],
//   setInitialCards: (hand: Array<string>) =>
//     set((state) => ({ cards: [[...hand]] })),
//   addToGroup: (card, toGroupId, fromGroupId) =>
//     set((state) => {
//       const result: typeof state = JSON.parse(JSON.stringify(state));

//       result.cards[Number(fromGroupId)] = result.cards[
//         Number(fromGroupId)
//       ].filter((c) => c !== card);

//       if (isNewGroup(toGroupId)) {
//         result.cards.push([card]);
//       } else {
//         result.cards[Number(toGroupId)].push(card);
//       }
//       return result;
//     }),
//   reorderCardInGroup: (groupIndex, fromIndex, toIndex) =>
//     set((state) => {
//       const result: typeof state = JSON.parse(JSON.stringify(state));
//       const group = result.cards[Number(groupIndex)];
//       const [movedCard] = group.splice(fromIndex, 1);

//       result.cards[Number(groupIndex)] = group.splice(
//         toIndex,
//         0,
//         movedCard
//       );
//       console.log({ result, group, movedCard, toIndex, groupIndex });
//       return result;
//     }),
// }));

const DnDWrapper = (props: React.PropsWithChildren<{}>) => {
  // const addToGroup = useRummyStore((state) => state.addToGroup);
  // const reorderCardInGroup = useRummyStore(
  //   (state) => state.reorderCardInGroup
  // );
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle when the drag ends
  // const handleDragEnd = (event: DragEndEvent) => {
  //   const { active, over } = event;
  //   if (!over || !active.data.current) return;

  //   const { card, cardIndex, cardGroup } = active.data.current;
  //   const toGroupIndex = over.id as string;
  //   const toIndex = over.data.current?.index; // Get the exact drop index
  //   console.log('event', event);

  //   const activeGroupIndex = active.data.current.sortable.containerId;
  //   const overGroupIndex = over.data.current?.sortable.containerId;

  //   console.log({ card, cardGroup, toGroupIndex, activeGroupIndex, overGroupIndex });
  //   // If a valid group is dropped on, move the card
  //   if (toGroupIndex !== undefined) {
  //     if (toGroupIndex === cardGroup) {
  //       reorderCardInGroup(toGroupIndex, cardIndex, toIndex);
  //     } else {
  //       addToGroup(card, toGroupIndex as string, cardGroup);
  //     }
  //   }
  // };

  const { moveCardWithinGroup, moveCardBetweenGroups } =
    useRummyStore();

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (!over) return;

    const activeGroupIndex = active.data.current.sortable.containerId;
    const overGroupIndex = over.data.current.sortable.containerId;
    console.log({
      activeGroupIndex,
      overGroupIndex,
      active,
      over,
    });

    if (activeGroupIndex === overGroupIndex) {
      // Move within the same group
      const oldIndex = active.data.current.sortable.index;
      const newIndex = over.data.current.sortable.index;

      moveCardWithinGroup(activeGroupIndex, oldIndex, newIndex);
    } else {
      // Move between different groups
      const cardIndex = active.data.current.sortable.index;
      moveCardBetweenGroups(
        activeGroupIndex,
        overGroupIndex,
        cardIndex
      );
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragEnd={handleDragEnd}
      collisionDetection={closestCenter}
    >
      {props.children}
    </DndContext>
  );
};

export default DnDWrapper;
