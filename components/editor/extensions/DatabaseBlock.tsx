import { NodeViewWrapper } from '@tiptap/react';
import React, { useState, useEffect } from 'react';
import { Plus, Type, List, CheckSquare, Trash2, X, Loader2, Hash, Calendar, Link, CircleDashed, MoreHorizontal, Check } from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';
import { doc, setDoc, updateDoc, onSnapshot, collection, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';

const SELECT_COLORS = [
  { id: 'default', name: 'Default', class: 'bg-neutral-700 text-neutral-200' },
  { id: 'gray', name: 'Gray', class: 'bg-neutral-600/50 text-neutral-300' },
  { id: 'brown', name: 'Brown', class: 'bg-amber-900/40 text-amber-500' },
  { id: 'orange', name: 'Orange', class: 'bg-orange-900/40 text-orange-500' },
  { id: 'yellow', name: 'Yellow', class: 'bg-yellow-900/40 text-yellow-500' },
  { id: 'green', name: 'Green', class: 'bg-emerald-900/40 text-emerald-500' },
  { id: 'blue', name: 'Blue', class: 'bg-blue-900/40 text-blue-500' },
  { id: 'purple', name: 'Purple', class: 'bg-purple-900/40 text-purple-500' },
  { id: 'pink', name: 'Pink', class: 'bg-pink-900/40 text-pink-500' },
  { id: 'red', name: 'Red', class: 'bg-red-900/40 text-red-500' },
];

const getSelectColorClass = (colorId: string) => {
  const color = SELECT_COLORS.find(c => c.id === colorId);
  return color ? color.class : SELECT_COLORS[0].class;
};

const getStatusColorClasses = (group: string) => {
  switch (group) {
    case 'In progress': return 'bg-blue-500/20 text-blue-300';
    case 'Complete': return 'bg-green-500/20 text-green-300';
    case 'To-do':
    default: return 'bg-neutral-500/20 text-neutral-300';
  }
};

const getStatusDotColor = (group: string) => {
  switch (group) {
    case 'In progress': return 'bg-blue-400';
    case 'Complete': return 'bg-green-400';
    case 'To-do':
    default: return 'bg-neutral-400';
  }
};

const ColumnSettings = ({ col, updateColumn, removeColumn, updateOptionName, removeOptionValue }: any) => {
  const [newOption, setNewOption] = useState('');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [newStatusOptions, setNewStatusOptions] = useState<{ [group: string]: string }>({
    'To-do': '',
    'In progress': '',
    'Complete': ''
  });

  const handleAddOption = () => {
    if (newOption.trim()) {
      const exists = col.options?.find((o: any) => (typeof o === 'string' ? o : o.value) === newOption.trim());
      if (!exists) {
        updateColumn(col.id, {
          ...col,
          options: [...(col.options || []), { id: `opt_${Date.now()}`, value: newOption.trim(), color: 'default' }]
        });
        setNewOption('');
      }
    }
  };

  const handleAddStatusOption = (group: string) => {
    const val = newStatusOptions[group];
    if (val?.trim() && !col.options?.find((o: any) => o.value === val.trim())) {
      updateColumn(col.id, {
        ...col,
        options: [...(col.options || []), { id: `opt_${Date.now()}`, value: val.trim(), group, color: 'gray' }]
      });
      setNewStatusOptions({ ...newStatusOptions, [group]: '' });
    }
  };

  const handleRemoveOption = (optToRemove: string) => {
    if (removeOptionValue) {
      removeOptionValue(col.id, optToRemove);
    } else {
      // Fallback for select if removeOptionValue is not provided
      updateColumn(col.id, {
        ...col,
        options: col.options.filter((opt: string) => opt !== optToRemove)
      });
    }
  };

  const handleRenameOption = (oldVal: string, newVal: string) => {
    if (oldVal !== newVal && newVal.trim() && updateOptionName) {
      updateOptionName(col.id, oldVal, newVal.trim());
    }
  };

  return (
    <div className="p-3 w-64 bg-neutral-800 border border-neutral-700 rounded-lg shadow-xl flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <label className="text-xs text-neutral-400 font-medium">Property Name</label>
        <input
          type="text"
          value={col.name}
          onChange={(e) => updateColumn(col.id, { ...col, name: e.target.value })}
          className="bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-sm text-neutral-200 focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-neutral-400 font-medium">Property Type</label>
        <select
          value={col.type}
          onChange={(e) => {
            const newType = e.target.value;
            let newOptions = null;
            if (newType === 'select') {
              newOptions = col.options?.map((o: any) => typeof o === 'string' ? o : o.value) || [];
            } else if (newType === 'status') {
              newOptions = col.options?.map((o: any) => typeof o === 'string' ? { id: `opt_${Date.now()}_${Math.random()}`, value: o, group: 'To-do', color: 'gray' } : o) || [
                { id: `opt_1`, value: 'Not started', group: 'To-do', color: 'gray' },
                { id: `opt_2`, value: 'In progress', group: 'In progress', color: 'blue' },
                { id: `opt_3`, value: 'Done', group: 'Complete', color: 'green' }
              ];
            }
            updateColumn(col.id, {
              ...col,
              type: newType,
              options: newOptions
            });
          }}
          className="bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-sm text-neutral-200 focus:outline-none focus:border-blue-500"
        >
          <option value="text">Text</option>
          <option value="number">Number</option>
          <option value="date">Date</option>
          <option value="url">URL</option>
          <option value="select">Select</option>
          <option value="status">Status</option>
          <option value="checkbox">Checkbox</option>
        </select>
      </div>

      {col.type === 'select' && (
        <div className="flex flex-col gap-2">
          <label className="text-xs text-neutral-400 font-medium">Options</label>
          <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
            {col.options?.map((opt: any) => {
              const isString = typeof opt === 'string';
              const optValue = isString ? opt : opt.value;
              const optColor = isString ? 'default' : opt.color;
              
              return (
                <div key={isString ? opt : opt.id} className="flex items-center justify-between bg-neutral-900 px-2 py-1 rounded border border-neutral-700 group/opt">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className={`inline-block w-2 h-2 rounded-full ${getSelectColorClass(optColor).split(' ')[0]}`} />
                    <input 
                      type="text" 
                      defaultValue={optValue}
                      onBlur={(e) => handleRenameOption(optValue, e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                      className="bg-transparent border-none focus:outline-none text-sm text-neutral-300 w-full truncate"
                    />
                  </div>
                  <Popover.Root>
                    <Popover.Trigger asChild>
                      <button className="text-neutral-500 hover:text-neutral-300 opacity-0 group-hover/opt:opacity-100 transition-opacity px-1">
                        <MoreHorizontal className="w-3 h-3" />
                      </button>
                    </Popover.Trigger>
                    <Popover.Portal>
                      <Popover.Content align="end" sideOffset={4} className="z-50 w-48 p-2 bg-neutral-800 border border-neutral-700 rounded-lg shadow-xl flex flex-col gap-2">
                        <div className="flex flex-col gap-1">
                          <input 
                            type="text" 
                            defaultValue={optValue}
                            onBlur={(e) => handleRenameOption(optValue, e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                            className="bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-sm text-neutral-200 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <button 
                          onClick={() => handleRemoveOption(optValue)}
                          className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 hover:bg-neutral-700 px-2 py-1.5 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                        <div className="h-px bg-neutral-700 my-1" />
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-neutral-500 font-medium px-2">Colors</span>
                          {SELECT_COLORS.map(c => (
                            <button
                              key={c.id}
                              onClick={() => {
                                const newOptions = col.options.map((o: any) => {
                                  const oVal = typeof o === 'string' ? o : o.value;
                                  if (oVal === optValue) {
                                    return { id: typeof o === 'string' ? `opt_${Date.now()}` : o.id, value: oVal, color: c.id };
                                  }
                                  return o;
                                });
                                updateColumn(col.id, { ...col, options: newOptions });
                              }}
                              className="flex items-center justify-between px-2 py-1.5 hover:bg-neutral-700 rounded text-sm text-neutral-300"
                            >
                              <div className="flex items-center gap-2">
                                <span className={`w-3 h-3 rounded-sm ${c.class.split(' ')[0]}`} />
                                {c.name}
                              </div>
                              {optColor === c.id && <Check className="w-3 h-3" />}
                            </button>
                          ))}
                        </div>
                      </Popover.Content>
                    </Popover.Portal>
                  </Popover.Root>
                </div>
              );
            })}
            {(!col.options || col.options.length === 0) && (
              <span className="text-xs text-neutral-500 italic">No options yet</span>
            )}
          </div>
          <div className="flex gap-1 mt-1">
            <input
              type="text"
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddOption()}
              placeholder="New option..."
              className="bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-sm text-neutral-200 focus:outline-none focus:border-blue-500 flex-1"
            />
            <button onClick={handleAddOption} className="bg-neutral-700 hover:bg-neutral-600 text-neutral-200 p-1 rounded flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      
      {col.type === 'status' && (
        <div className="flex flex-col gap-3 mt-2">
          {['To-do', 'In progress', 'Complete'].map(group => (
            <div key={group} className="flex flex-col gap-1">
              <span className="text-[10px] uppercase text-neutral-500 font-semibold">{group}</span>
              {col.options?.filter((o: any) => o.group === group).map((opt: any) => (
                <div key={opt.id} className="flex items-center justify-between bg-neutral-900 px-2 py-1 rounded border border-neutral-700 group/opt">
                  <input 
                    type="text" 
                    defaultValue={opt.value}
                    onBlur={(e) => handleRenameOption(opt.value, e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                    className="bg-transparent border-none focus:outline-none text-sm text-neutral-300 w-full"
                  />
                  <button onClick={() => handleRemoveOption(opt.value)} className="text-neutral-500 hover:text-red-400 opacity-0 group-hover/opt:opacity-100 transition-opacity">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <div className="flex gap-1 mt-1">
                <input
                  type="text"
                  value={newStatusOptions[group] || ''}
                  onChange={(e) => setNewStatusOptions({ ...newStatusOptions, [group]: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddStatusOption(group)}
                  placeholder="New option..."
                  className="bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-sm text-neutral-200 focus:outline-none focus:border-blue-500 flex-1"
                />
                <button onClick={() => handleAddStatusOption(group)} className="bg-neutral-700 hover:bg-neutral-600 text-neutral-200 p-1 rounded flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {isConfirmingDelete ? (
        <div className="flex flex-col gap-2 pt-2 border-t border-neutral-700 mt-1">
          <span className="text-xs text-neutral-400">Are you sure?</span>
          <div className="flex gap-2">
            <button onClick={() => removeColumn(col.id)} className="flex-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 py-1 rounded text-xs font-medium">Delete</button>
            <button onClick={() => setIsConfirmingDelete(false)} className="flex-1 bg-neutral-700 text-neutral-300 hover:bg-neutral-600 py-1 rounded text-xs font-medium">Cancel</button>
          </div>
        </div>
      ) : (
        <div className="pt-2 border-t border-neutral-700 mt-1">
          <button 
            onClick={() => setIsConfirmingDelete(true)}
            className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 w-full px-2 py-1.5 rounded transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete Property
          </button>
        </div>
      )}
    </div>
  );
};

const CellInput = ({ value, type, onUpdate, placeholder }: { value: string, type: string, onUpdate: (val: string) => void, placeholder?: string }) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  return (
    <input
      type={type}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={() => {
        if (localValue !== value) {
          onUpdate(localValue);
        }
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.currentTarget.blur();
        }
      }}
      className={`bg-transparent border-none focus:outline-none text-neutral-300 w-full placeholder-neutral-600 ${type === 'date' ? '[color-scheme:dark]' : ''} ${type === 'number' ? 'text-right' : ''} ${type === 'url' ? 'text-blue-400 hover:text-blue-300 underline' : ''}`}
      placeholder={placeholder}
    />
  );
};

export const DatabaseBlock = (props: any) => {
  const { databaseId } = props.node.attrs;
  const { pageId, userId } = props.extension.options;
  const updateAttributes = props.updateAttributes;

  const [dbData, setDbData] = useState<{ columns: any[], rows: any[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [resizingCol, setResizingCol] = useState<string | null>(null);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);
  const [draggedCol, setDraggedCol] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<{ id: string, position: 'left' | 'right' } | null>(null);

  const dbDataRef = React.useRef(dbData);
  useEffect(() => {
    dbDataRef.current = dbData;
  }, [dbData]);

  useEffect(() => {
    if (!resizingCol) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const newWidth = Math.max(50, startWidth + deltaX);
      
      setDbData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          columns: prev.columns.map(c => c.id === resizingCol ? { ...c, width: newWidth } : c)
        };
      });
    };

    const handleMouseUp = () => {
      if (resizingCol && dbDataRef.current) {
        const col = dbDataRef.current.columns.find(c => c.id === resizingCol);
        if (col) {
          updateColumn(resizingCol, col);
        }
      }
      setResizingCol(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resizingCol, startX, startWidth]);

  const handleResizeStart = (e: React.MouseEvent, colId: string, currentWidth: number) => {
    e.preventDefault();
    e.stopPropagation();
    setResizingCol(colId);
    setStartX(e.clientX);
    setStartWidth(currentWidth);
  };

  const handleDragStart = (e: React.DragEvent, colId: string) => {
    setDraggedCol(colId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    if (colId !== draggedCol) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const isRight = e.clientX > rect.left + rect.width / 2;
      setDragOverCol({ id: colId, position: isRight ? 'right' : 'left' });
    }
  };

  const handleDragEnd = () => {
    setDraggedCol(null);
    setDragOverCol(null);
  };

  const handleDrop = (e: React.DragEvent, targetColId: string) => {
    e.preventDefault();
    if (draggedCol && draggedCol !== targetColId && dbData && dragOverCol) {
      const newColumns = [...dbData.columns];
      const draggedIdx = newColumns.findIndex(c => c.id === draggedCol);
      const [draggedItem] = newColumns.splice(draggedIdx, 1);
      
      const newTargetIdx = newColumns.findIndex(c => c.id === targetColId);
      const insertIdx = dragOverCol.position === 'right' ? newTargetIdx + 1 : newTargetIdx;
      
      newColumns.splice(insertIdx, 0, draggedItem);
      
      updateFirestore({ columns: newColumns });
    }
    setDraggedCol(null);
    setDragOverCol(null);
  };

  useEffect(() => {
    if (!pageId || !userId) return;

    let unsubscribe: () => void;

    const initDatabase = async () => {
      if (!databaseId) {
        // Create new database document
        try {
          const newDbRef = doc(collection(db, 'databases'));
          const initialData = {
            id: newDbRef.id,
            pageId,
            userId,
            columns: props.node.attrs.columns || [
              { id: 'col_1', name: 'Name', type: 'text' },
              { id: 'col_2', name: 'Status', type: 'select', options: ['To Do', 'In Progress', 'Done'] },
            ],
            rows: props.node.attrs.rows || [
              { id: 'row_1', col_1: 'Task 1', col_2: 'To Do' },
              { id: 'row_2', col_1: 'Task 2', col_2: 'In Progress' },
              { id: 'row_3', col_1: 'Task 3', col_2: 'Done' },
            ],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };
          
          await setDoc(newDbRef, initialData);
          updateAttributes({ databaseId: newDbRef.id });
          // The onSnapshot will pick it up once databaseId is updated
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, 'databases');
          setIsLoading(false);
        }
      } else {
        // Subscribe to existing database document
        unsubscribe = onSnapshot(doc(db, 'databases', databaseId), (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setDbData({ columns: data.columns || [], rows: data.rows || [] });
          }
          setIsLoading(false);
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, `databases/${databaseId}`);
          setIsLoading(false);
        });
      }
    };

    initDatabase();

    return () => {
      if (unsubscribe) unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [databaseId, pageId, userId]);

  const updateFirestore = async (newData: any) => {
    if (!databaseId) return;
    try {
      await updateDoc(doc(db, 'databases', databaseId), {
        ...newData,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `databases/${databaseId}`);
    }
  };

  const addRow = () => {
    if (!dbData) return;
    const newRow: any = { id: `row_${Date.now()}` };
    dbData.columns.forEach((col: any) => {
      newRow[col.id] = '';
    });
    updateFirestore({ rows: [...dbData.rows, newRow] });
  };

  const addColumn = () => {
    if (!dbData) return;
    const newColId = `col_${Date.now()}`;
    const newCol = { id: newColId, name: 'New Column', type: 'text' };
    updateFirestore({
      columns: [...dbData.columns, newCol],
      rows: dbData.rows.map((row: any) => ({ ...row, [newColId]: '' })),
    });
  };

  const updateCell = (rowId: string, colId: string, value: string) => {
    if (!dbData) return;
    updateFirestore({
      rows: dbData.rows.map((row: any) => 
        row.id === rowId ? { ...row, [colId]: value } : row
      )
    });
  };

  const updateColumn = (colId: string, newColData: any) => {
    if (!dbData) return;
    updateFirestore({
      columns: dbData.columns.map((col: any) =>
        col.id === colId ? newColData : col
      )
    });
  };

  const removeColumn = (colId: string) => {
    if (!dbData) return;
    updateFirestore({
      columns: dbData.columns.filter((col: any) => col.id !== colId)
    });
  };

  const updateOptionName = (colId: string, oldVal: string, newVal: string) => {
    if (!dbData) return;
    const col = dbData.columns.find((c: any) => c.id === colId);
    if (!col) return;

    let newOptions = col.options;
    if (col.type === 'select') {
      newOptions = col.options.map((opt: any) => {
        if (typeof opt === 'string') return opt === oldVal ? newVal : opt;
        return opt.value === oldVal ? { ...opt, value: newVal } : opt;
      });
    } else if (col.type === 'status') {
      newOptions = col.options.map((opt: any) => opt.value === oldVal ? { ...opt, value: newVal } : opt);
    }

    const newRows = dbData.rows.map((row: any) => 
      row[colId] === oldVal ? { ...row, [colId]: newVal } : row
    );

    updateFirestore({
      columns: dbData.columns.map((c: any) => c.id === colId ? { ...c, options: newOptions } : c),
      rows: newRows
    });
  };

  const removeOptionValue = (colId: string, valToRemove: string) => {
    if (!dbData) return;
    const col = dbData.columns.find((c: any) => c.id === colId);
    if (!col) return;

    let newOptions = col.options;
    if (col.type === 'select') {
      newOptions = col.options.filter((opt: any) => (typeof opt === 'string' ? opt : opt.value) !== valToRemove);
    } else if (col.type === 'status') {
      newOptions = col.options.filter((opt: any) => opt.value !== valToRemove);
    }

    const newRows = dbData.rows.map((row: any) => 
      row[colId] === valToRemove ? { ...row, [colId]: '' } : row
    );

    updateFirestore({
      columns: dbData.columns.map((c: any) => c.id === colId ? { ...c, options: newOptions } : c),
      rows: newRows
    });
  };

  const getColumnIcon = (type: string) => {
    switch (type) {
      case 'text': return <Type className="w-3 h-3" />;
      case 'number': return <Hash className="w-3 h-3" />;
      case 'date': return <Calendar className="w-3 h-3" />;
      case 'url': return <Link className="w-3 h-3" />;
      case 'select': return <List className="w-3 h-3" />;
      case 'status': return <CircleDashed className="w-3 h-3" />;
      case 'checkbox': return <CheckSquare className="w-3 h-3" />;
      default: return <Type className="w-3 h-3" />;
    }
  };

  if (isLoading || !dbData) {
    return (
      <NodeViewWrapper className="my-8" contentEditable={false} data-type="database">
        <div className="border border-neutral-700 rounded-lg overflow-hidden bg-neutral-900/50 p-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-neutral-500 animate-spin" />
        </div>
      </NodeViewWrapper>
    );
  }

  const { columns, rows } = dbData;

  return (
    <NodeViewWrapper className="my-8" contentEditable={false} data-type="database">
      <div className="overflow-x-auto">
        <table className="text-left border-collapse text-sm w-max min-w-full table-fixed !m-0">
          <thead>
            <tr className="">
              {columns.map((col: any) => (
                <th 
                  key={col.id} 
                  className={`!p-0 !font-medium !text-neutral-400 !bg-transparent !border-0 relative transition-colors ${dragOverCol?.id === col.id ? '!bg-neutral-800/30' : ''}`}
                  style={{ width: col.width || 150, minWidth: col.width || 150, maxWidth: col.width || 150 }}
                  draggable
                  onDragStart={(e) => handleDragStart(e, col.id)}
                  onDragOver={(e) => handleDragOver(e, col.id)}
                  onDragEnd={handleDragEnd}
                  onDrop={(e) => handleDrop(e, col.id)}
                >
                  {dragOverCol?.id === col.id && dragOverCol?.position === 'left' && (
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-500 z-20" />
                  )}
                  {dragOverCol?.id === col.id && dragOverCol?.position === 'right' && (
                    <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-blue-500 z-20" />
                  )}
                  <Popover.Root>
                    <Popover.Trigger asChild>
                      <button className="flex items-center gap-2 w-full p-2 hover:bg-neutral-800/50 transition-colors text-left focus:outline-none h-full">
                        {getColumnIcon(col.type)}
                        <span className="truncate">{col.name}</span>
                      </button>
                    </Popover.Trigger>
                    <Popover.Portal>
                      <Popover.Content align="start" sideOffset={4} className="z-50">
                        <ColumnSettings 
                          col={col} 
                          updateColumn={updateColumn} 
                          removeColumn={removeColumn} 
                          updateOptionName={updateOptionName}
                          removeOptionValue={removeOptionValue}
                        />
                      </Popover.Content>
                    </Popover.Portal>
                  </Popover.Root>
                  <div 
                    className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500 z-10"
                    onMouseDown={(e) => handleResizeStart(e, col.id, col.width || 150)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </th>
              ))}
              <th className="!p-0 !bg-transparent !border-0 hover:bg-neutral-800/50 cursor-pointer w-full text-left !align-middle" onClick={addColumn}>
                <div className="flex items-center p-2 h-full min-h-[36px]">
                  <Plus className="w-4 h-4 text-neutral-400" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="border-t border-neutral-700/50">
            {rows.map((row: any) => (
              <tr key={row.id} className="hover:bg-neutral-800/30 group">
                {columns.map((col: any) => (
                  <td 
                    key={col.id} 
                    className="!p-2 !border-0 !border-b !border-r !border-neutral-700/50 !align-middle"
                    style={{ width: col.width || 150, minWidth: col.width || 150, maxWidth: col.width || 150 }}
                  >
                      {col.type === 'select' ? (
                        <Popover.Root>
                          <Popover.Trigger asChild>
                            <button className="w-full text-left flex items-center min-h-[24px] focus:outline-none">
                              {row[col.id] ? (() => {
                                const opt = col.options?.find((o: any) => (typeof o === 'string' ? o : o.value) === row[col.id]);
                                const optColor = opt ? (typeof opt === 'string' ? 'default' : opt.color) : 'default';
                                return (
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getSelectColorClass(optColor)}`}>
                                    {row[col.id]}
                                  </span>
                                );
                              })() : (
                                <span className="text-neutral-600">Empty</span>
                              )}
                            </button>
                          </Popover.Trigger>
                          <Popover.Portal>
                            <Popover.Content align="start" className="z-50 w-56 p-1 bg-neutral-800 border border-neutral-700 rounded shadow-xl flex flex-col gap-1">
                              <div className="px-2 py-1 text-xs font-medium text-neutral-500">Select an option or create one</div>
                              <div className="max-h-48 overflow-y-auto flex flex-col gap-0.5">
                                {col.options?.map((opt: any) => {
                                  const isString = typeof opt === 'string';
                                  const optValue = isString ? opt : opt.value;
                                  const optColor = isString ? 'default' : opt.color;
                                  return (
                                    <div key={isString ? opt : opt.id} className="flex items-center justify-between group/opt hover:bg-neutral-700 rounded px-1">
                                      <Popover.Close asChild>
                                        <button
                                          onClick={() => updateCell(row.id, col.id, optValue)}
                                          className="flex-1 text-left px-2 py-1.5 text-sm flex items-center gap-2"
                                        >
                                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getSelectColorClass(optColor)}`}>
                                            {optValue}
                                          </span>
                                        </button>
                                      </Popover.Close>
                                      <Popover.Root>
                                        <Popover.Trigger asChild>
                                          <button className="p-1 text-neutral-500 hover:text-neutral-300 opacity-0 group-hover/opt:opacity-100 transition-opacity rounded hover:bg-neutral-600">
                                            <MoreHorizontal className="w-3 h-3" />
                                          </button>
                                        </Popover.Trigger>
                                        <Popover.Portal>
                                          <Popover.Content align="end" sideOffset={4} className="z-50 w-48 p-2 bg-neutral-800 border border-neutral-700 rounded-lg shadow-xl flex flex-col gap-2">
                                            <div className="flex flex-col gap-1">
                                              <input 
                                                type="text" 
                                                defaultValue={optValue}
                                                onBlur={(e) => updateOptionName(col.id, optValue, e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                                                className="bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-sm text-neutral-200 focus:outline-none focus:border-blue-500"
                                              />
                                            </div>
                                            <button 
                                              onClick={() => removeOptionValue(col.id, optValue)}
                                              className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 hover:bg-neutral-700 px-2 py-1.5 rounded transition-colors"
                                            >
                                              <Trash2 className="w-4 h-4" /> Delete
                                            </button>
                                            <div className="h-px bg-neutral-700 my-1" />
                                            <div className="flex flex-col gap-1">
                                              <span className="text-xs text-neutral-500 font-medium px-2">Colors</span>
                                              {SELECT_COLORS.map(c => (
                                                <button
                                                  key={c.id}
                                                  onClick={() => {
                                                    const newOptions = col.options.map((o: any) => {
                                                      const oVal = typeof o === 'string' ? o : o.value;
                                                      if (oVal === optValue) {
                                                        return { id: typeof o === 'string' ? `opt_${Date.now()}` : o.id, value: oVal, color: c.id };
                                                      }
                                                      return o;
                                                    });
                                                    updateColumn(col.id, { ...col, options: newOptions });
                                                  }}
                                                  className="flex items-center justify-between px-2 py-1.5 hover:bg-neutral-700 rounded text-sm text-neutral-300"
                                                >
                                                  <div className="flex items-center gap-2">
                                                    <span className={`w-3 h-3 rounded-sm ${c.class.split(' ')[0]}`} />
                                                    {c.name}
                                                  </div>
                                                  {optColor === c.id && <Check className="w-3 h-3" />}
                                                </button>
                                              ))}
                                            </div>
                                          </Popover.Content>
                                        </Popover.Portal>
                                      </Popover.Root>
                                    </div>
                                  );
                                })}
                              </div>
                              <div className="h-px bg-neutral-700 my-1" />
                              <Popover.Close asChild>
                                <button
                                  onClick={() => updateCell(row.id, col.id, '')}
                                  className="text-left px-2 py-1.5 text-sm text-neutral-400 hover:bg-neutral-700 rounded"
                                >
                                  Clear
                                </button>
                              </Popover.Close>
                            </Popover.Content>
                          </Popover.Portal>
                        </Popover.Root>
                      ) : col.type === 'status' ? (
                        <Popover.Root>
                          <Popover.Trigger asChild>
                            <button className="w-full text-left flex items-center min-h-[24px] focus:outline-none">
                              {row[col.id] ? (() => {
                                const opt = col.options?.find((o: any) => o.value === row[col.id]);
                                return opt ? (
                                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium ${getStatusColorClasses(opt.group)}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${getStatusDotColor(opt.group)}`}></span>
                                    {opt.value}
                                  </span>
                                ) : (
                                  <span className="text-neutral-600">Empty</span>
                                );
                              })() : (
                                <span className="text-neutral-600">Empty</span>
                              )}
                            </button>
                          </Popover.Trigger>
                          <Popover.Portal>
                            <Popover.Content align="start" className="z-50 w-48 p-1 bg-neutral-800 border border-neutral-700 rounded shadow-xl flex flex-col gap-1">
                              <Popover.Close asChild>
                                <button
                                  onClick={() => updateCell(row.id, col.id, '')}
                                  className="text-left px-2 py-1.5 text-sm text-neutral-400 hover:bg-neutral-700 rounded"
                                >
                                  Clear
                                </button>
                              </Popover.Close>
                              {['To-do', 'In progress', 'Complete'].map(group => {
                                const groupOpts = col.options?.filter((o: any) => o.group === group);
                                if (!groupOpts || groupOpts.length === 0) return null;
                                return (
                                  <div key={group} className="flex flex-col">
                                    <span className="text-[10px] uppercase text-neutral-500 font-semibold px-2 py-1">{group}</span>
                                    {groupOpts.map((opt: any) => (
                                      <Popover.Close asChild key={opt.id}>
                                        <button
                                          onClick={() => updateCell(row.id, col.id, opt.value)}
                                          className="text-left px-2 py-1.5 text-sm text-neutral-200 hover:bg-neutral-700 rounded flex items-center gap-2"
                                        >
                                          <span className={`w-2 h-2 rounded-full ${getStatusDotColor(opt.group)}`}></span>
                                          {opt.value}
                                        </button>
                                      </Popover.Close>
                                    ))}
                                  </div>
                                );
                              })}
                            </Popover.Content>
                          </Popover.Portal>
                        </Popover.Root>
                      ) : col.type === 'checkbox' ? (
                        <div className="flex items-center justify-start w-full h-full min-h-[24px]">
                          <div 
                            onClick={() => updateCell(row.id, col.id, row[col.id] === 'true' ? 'false' : 'true')}
                            className={`w-4 h-4 rounded-sm border flex items-center justify-center cursor-pointer transition-colors ${row[col.id] === 'true' ? 'bg-blue-500 border-blue-500' : 'border-neutral-600 hover:border-neutral-500'}`}
                          >
                            {row[col.id] === 'true' && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                          </div>
                        </div>
                      ) : col.type === 'date' ? (
                        <CellInput
                          type="date"
                          value={row[col.id] || ''}
                          onUpdate={(val) => updateCell(row.id, col.id, val)}
                        />
                      ) : col.type === 'number' ? (
                        <CellInput
                          type="number"
                          value={row[col.id] || ''}
                          onUpdate={(val) => updateCell(row.id, col.id, val)}
                          placeholder="Empty"
                        />
                      ) : col.type === 'url' ? (
                        <CellInput
                          type="url"
                          value={row[col.id] || ''}
                          onUpdate={(val) => updateCell(row.id, col.id, val)}
                          placeholder="Empty"
                        />
                      ) : (
                        <CellInput
                          type="text"
                          value={row[col.id] || ''}
                          onUpdate={(val) => updateCell(row.id, col.id, val)}
                          placeholder="Empty"
                        />
                      )}
                    </td>
                  ))}
                  <td className="!p-2 !border-0 !border-b !border-neutral-700/50 !align-middle"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-1">
          <button
            onClick={addRow}
            className="flex items-center gap-2 text-sm text-neutral-400 hover:text-neutral-200 px-2 py-1.5 rounded hover:bg-neutral-800/50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New
          </button>
        </div>
    </NodeViewWrapper>
  );
};
