import React from 'react';
import { useDroppable } from '@dnd-kit/core';

const Droppable = ({
  children,
  data,
  id,
}: React.PropsWithChildren<{ id: string; data?: any }>) => {
  const { isOver, setNodeRef } = useDroppable({
    id,
    data
  });
  const style: React.CSSProperties = {
    color: isOver ? 'green' : null,
    borderColor: isOver ? 'green' : null,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {children}
    </div>
  );
};

export default Droppable;
