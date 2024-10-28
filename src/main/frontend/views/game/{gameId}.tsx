import React from 'react';
import {
  closestCorners,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  UniqueIdentifier,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import DnDWrapper, {
  useRummyStore,
} from 'Frontend/components/DnDWrapper';
import Draggable from 'Frontend/components/Draggable';
import Droppable from 'Frontend/components/Droppable';
import PlayingCard from 'Frontend/components/PlayingCard';
import { HSpace } from 'Frontend/components/utils.component';
import Player from 'Frontend/generated/com/example/application/player/Player';
import { GameService } from 'Frontend/generated/endpoints';
import { TRank, TSuit } from 'Frontend/types';
import { NEW_GROUP } from 'Frontend/utils';
import { useParams } from 'react-router-dom';

type TGameState = {
  gameId: number;
  topDiscardCard: string;
  isGameOver: boolean;
  canBePlayed: boolean;
};

const useGameState = () => {
  const [gameState, setGameState] = React.useState<TGameState | null>(
    null
  );

  React.useEffect(() => {
    const websocket = new WebSocket(
      `ws://${window.location.host}/game`
    );
    websocket.onopen = () => {
      console.log('connected');
    };
    websocket.onmessage = (event) => {
      const data: TGameState = JSON.parse(event.data);
      console.log('gameState', data);
      setGameState(data);
    };
    return () => {
      websocket.close();
    };
  }, []);

  return gameState;
};

const JoinGameForm = ({
  gameId,
  setPlayer,
}: {
  gameId: string;
  setPlayer: (p: Player) => void;
}) => {
  const [submitted, setSubmitted] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const onFormSubmit: React.DOMAttributes<HTMLFormElement>['onSubmit'] =
    async (e) => {
      e.preventDefault();
      const player = await GameService.addPlayer(
        Number(gameId),
        inputRef.current?.value
      );
      if (!player?.id) return;
      setPlayer(player);
      setSubmitted(true);
    };

  return (
    <section>
      <form onSubmit={onFormSubmit}>
        <input type="text" ref={inputRef} />
        <button type="submit">Join game</button>
        {submitted && <div>Waiting for other players...</div>}
      </form>
    </section>
  );
};

function getSuit(card: string, splitCard: string[]) {
  return (
    card === 'JOKER' ? card : splitCard[splitCard.length - 1]
  ) as TSuit;
}

function getRank(card: string, splitCard: string[]) {
  return (
    card === 'JOKER'
      ? card
      : splitCard.slice(0, splitCard.length - 1).join('')
  ) as TRank;
}

// function CardGroup(props: {
//   cardGroup: string[];
//   groupIndex: number;
// }) {
//   const [items, setItems] = React.useState(props.cardGroup);

//   return (

//   );
// }

const _Playground = ({
  player,
  gameId,
}: {
  gameId: string;
  player: Player | undefined;
}) => {
  const { setInitialCards, cards } = useRummyStore();
  React.useEffect(() => {
    if (player?.hand) {
      setInitialCards(player?.hand?.map((c) => c || '') || []);
    }
    return () => {
      if (!player) return;
      const players = GameService.removePlayer(
        Number(gameId),
        player?.id
      );
    };
  }, [player?.hand]);

  console.log('cards', cards);

  return (
    <DnDWrapper>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {cards.map((cardGroup, groupIndex) => {
          return (
            <SortableContext
              strategy={horizontalListSortingStrategy}
              key={groupIndex}
              items={cardGroup.map(
                (card, index) => `${groupIndex}-${index}`
              )}
            >
              {/* <Droppable
                id={String(groupIndex)}
                data={{ index: groupIndex }}
              > */}

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {cardGroup.map((card, cardIndex) => {
                  if (!card) return null;
                  const splitCard = card.split('');
                  const rank = getRank(card, splitCard);
                  const suit = getSuit(card, splitCard);
                  return (
                    <Draggable
                      id={`${card}-${cardIndex}`}
                      key={`${card}-${cardIndex}`}
                      data={{
                        card,
                        cardIndex,
                        cardGroup: String(groupIndex),
                      }}
                    >
                      <PlayingCard rank={rank} suit={suit} />
                    </Draggable>
                  );
                })}
              </div>
              {/* </Droppable> */}
              <HSpace />
            </SortableContext>
          );
        })}

        <HSpace />
        <HSpace />
        <Droppable id={NEW_GROUP}>
          <div
            style={{
              width: '70px',
              height: '100px',
              border: '1px solid #333',
              borderRadius: '8px',
              backgroundColor: '#fff',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '5px',
              fontFamily: 'Arial, sans-serif',
            }}
          >
            +
          </div>
        </Droppable>
      </div>
    </DnDWrapper>
  );
};

const GameView = () => {
  const { gameId } = useParams();

  const gameState = useGameState();

  const [player, setPlayer] = React.useState<Player>();

  if (!gameId) return null;

  if (!gameState?.canBePlayed)
    return <JoinGameForm gameId={gameId} setPlayer={setPlayer} />;

  if (!player?.hand) return null;

  return <Playground gameId={gameId} player={player} />;
};

const wrapperStyle = {
  display: 'flex',
  flexDirection: 'row',
};

const CardWrapper = ({
  card,
  children,
}: {
  card: string;
  children: (rank: TRank, suit: TSuit) => React.ReactNode;
}) => {
  const splitCard = card.split('');
  const rank = getRank(card, splitCard);
  const suit = getSuit(card, splitCard);

  return <React.Fragment>{children(rank, suit)}</React.Fragment>;
};

const Playground = ({
  player,
  gameId,
}: {
  gameId: string;
  player: Player;
}) => {
  React.useEffect(() => {
    return () => {
      if (!player) return;
      const players = GameService.removePlayer(
        Number(gameId),
        player?.id
      );
    };
  }, [player?.hand]);
  const [items, setItems] = React.useState<{
    [key: string]: Array<UniqueIdentifier>;
  }>({
    hand: player?.hand?.map((c) => c || '') || [],
    [NEW_GROUP]: [],
  });
  const [activeId, setActiveId] =
    React.useState<UniqueIdentifier | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  console.log('items', items);

  return (
    <div style={wrapperStyle}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {Object.keys(items).map((key) => (
          <CardGroup key={key} id={key} cards={items[key]} />
        ))}
        <DragOverlay>
          {activeId ? (
            <CardWrapper card={activeId as string}>
              {(rank, suit) => (
                <PlayingCard rank={rank} suit={suit} />
              )}
            </CardWrapper>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );

  function findContainer(id: UniqueIdentifier) {
    if (id in items) {
      return id;
    }

    return Object.keys(items).find((key) => items[key].includes(id));
  }

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const { id } = active;

    setActiveId(id);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    const { id } = active;
    if (!over) return;
    const { id: overId } = over;

    // Find the containers
    const activeContainer = findContainer(id);
    const overContainer = findContainer(overId);

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer === overContainer
    ) {
      return;
    }

    setItems((prev) => {
      const activeItems = prev[activeContainer];
      const overItems = prev[overContainer];

      // Find the indexes for the items
      const activeIndex = activeItems.indexOf(id);
      const overIndex = overItems.indexOf(overId);

      let newIndex;
      if (overId in prev) {
        // We're at the root droppable of a container
        newIndex = overItems.length + 1;
      } else {
        newIndex =
          overIndex >= 0 ? overIndex + 1 : overItems.length + 1;
      }

      if (overContainer === NEW_GROUP) {
        console.log('over', {
          activeContainer,
          overContainer,
          activeIndex,
          newIndex,
          overIndex,
        });
        // return {
        //   ...prev,
        //   [activeContainer]: [
        //     ...prev[activeContainer].filter(
        //       (item) => item !== active.id
        //     ),
        //   ],
        //   // [`meld${Object.keys(items).length - 2}`]: [items[activeContainer][activeIndex]],
        // };
      }

      return {
        ...prev,
        [activeContainer]: [
          ...prev[activeContainer].filter(
            (item) => item !== active.id
          ),
        ],
        [overContainer]: [
          ...prev[overContainer].slice(0, newIndex),
          items[activeContainer][activeIndex],
          ...prev[overContainer].slice(
            newIndex,
            prev[overContainer].length
          ),
        ],
      };
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    const { id } = active;
    if (!over) return;
    const { id: overId } = over;

    const activeContainer = findContainer(id);
    const overContainer = findContainer(overId);

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer !== overContainer
    ) {
      return;
    }

    const activeIndex = items[activeContainer].indexOf(active.id);
    const overIndex = items[overContainer].indexOf(overId);

    if (overContainer === NEW_GROUP) {
      console.log('end', {
        overContainer,
        activeContainer,
        activeIndex,
        overIndex,
        items: items[overContainer],
      });
      setItems((items) => {
        return {
          ...items,
          [`meld${Object.keys(items).length + 1}`]: arrayMove(
            items[overContainer],
            activeIndex,
            overIndex
          ),
          [NEW_GROUP]: [],
        };
      });
      return;
    }
    console.log({ activeIndex, overIndex });
    if (activeIndex !== overIndex) {
      console.log('here!!!');
      setItems((items) => {
        return {
          ...items,
          [overContainer]: arrayMove(
            items[overContainer],
            activeIndex,
            overIndex
          ),
        };
      });
    }

    setActiveId(null);
  }
};

const containerStyle = {
  background: '#dadada',
  padding: 10,
  margin: 10,
  flex: 1,
  display: 'flex',
  flexDirection: 'row', // Change to row for horizontal layout
};

export function CardGroup(props: any) {
  const { id, cards } = props;

  const { setNodeRef } = useDroppable({
    id,
  });

  return (
    <SortableContext
      id={id}
      items={cards}
      strategy={horizontalListSortingStrategy} // Use horizontal strategy
    >
      <div ref={setNodeRef} style={containerStyle}>
        {cards.map((id: any, index: number) => (
          <SortableItem key={`${id}-${index}`} id={id} />
        ))}
      </div>
    </SortableContext>
  );
}

export function Item(props: any) {
  const { id } = props;

  const style = {
    width: 100, // Adjust width to fit horizontally
    height: 50,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid black',
    margin: '0 10px', // Adjust margin for horizontal spacing
    background: 'white',
  };

  return <div style={style}>{id}</div>;
}

export function SortableItem(props: any) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: props.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <CardWrapper card={props.id as string}>
        {(rank, suit) => <PlayingCard rank={rank} suit={suit} />}
      </CardWrapper>
    </div>
  );
}

export default GameView;
