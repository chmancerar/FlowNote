import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';

export const CommandList = forwardRef((props: any, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [prevItems, setPrevItems] = useState(props.items);

  if (props.items !== prevItems) {
    setSelectedIndex(0);
    setPrevItems(props.items);
  }

  const selectItem = (index: number) => {
    const item = props.items[index];
    if (item) {
      props.command(item);
    }
  };

  const upHandler = () => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: any) => {
      if (event.key === 'ArrowUp') {
        upHandler();
        return true;
      }
      if (event.key === 'ArrowDown') {
        downHandler();
        return true;
      }
      if (event.key === 'Enter') {
        enterHandler();
        return true;
      }
      return false;
    },
  }));

  return (
    <div className="flex flex-col gap-1 p-2 bg-neutral-800 border border-neutral-700 rounded-lg shadow-xl overflow-hidden w-64 z-50">
      {props.items.length ? (
        props.items.map((item: any, index: number) => (
          <button
            className={`flex items-center gap-2 px-2 py-1.5 text-sm text-left rounded-md transition-colors ${
              index === selectedIndex ? 'bg-neutral-700 text-white' : 'text-neutral-300 hover:bg-neutral-700 hover:text-white'
            }`}
            key={index}
            onClick={() => selectItem(index)}
          >
            {item.icon}
            <span>{item.title}</span>
          </button>
        ))
      ) : (
        <div className="p-2 text-sm text-neutral-500">No results</div>
      )}
    </div>
  );
});

CommandList.displayName = 'CommandList';
