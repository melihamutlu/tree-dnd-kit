// src/App.tsx   meihamutlu
import { useMemo, useState } from "react";
import {
  DndContext,
  DragStartEvent,
  DragMoveEvent,
  DragEndEvent,
  DragOverEvent,
  MeasuringStrategy,
  UniqueIdentifier,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import {
  buildTree,
  flattenTree,
  getProjection,
  removeItem,
  removeChildrenOf,
  setProperty,
} from "./utilities";
import type { FlattenedItem, TreeItems } from "./types";
import { SortableTreeItem } from "./components/SortableTree";

const initialItems: TreeItems = [
  //Agac yapısının oluşturulması
  {
    id: "Information",
    children: [],
  },
  {
    id: "Resume",
    children: [
      { id: "Internship", children: [] },
      { id: "Certificates ", children: [
        { id: "English C-1", children: [] },
        { id: "Microsoft Azur-101", children:[]}
      ] },
      { id: "Experiences", children: [] },
      { id: "Hobies", children: [
        { id: "Football", children:[]}
      ] },
    ],
  },
  {
    id: "About Us",
    children: [],
  },
  {
    id: "My Account",
    children: [
      { id: "Address", children: [] },
      { id: "Date of Birth", children: [] },
    ],
  },
];
// elemanların dnd işlemi gerçekleşirken ölçüm durumunun aktif olmsını sağlar
const measuring = {
  droppable: {
    strategy: MeasuringStrategy.Always,
  },
};

interface Props {
  collapsible?: boolean;
  defaultItems?: TreeItems;
  indentationWidth?: number;
  indicator?: boolean;
  removable?: boolean;
}

export function SortableTree({
  collapsible,
  defaultItems = initialItems,
  indicator = false,
  indentationWidth = 50,
  removable,
}: Props) {
  const [items, setItems] = useState(() => defaultItems);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [overId, setOverId] = useState<UniqueIdentifier | null>(null);
  const [offsetLeft, setOffsetLeft] = useState(0);
  const [currentPosition, setCurrentPosition] = useState<{
    parentId: UniqueIdentifier | null;
    overId: UniqueIdentifier;
  } | null>(null);

  // useMemo önbelleğe alınmış hesaplamalar gerçekleştirir. tekrar tekrar render edilmesini önler
  const flattenedItems = useMemo(() => {
    const flattenedTree = flattenTree(items);
    const collapsedItems = flattenedTree.reduce<string[]>(
      (acc, { children, collapsed, id }) =>
        collapsed && children.length ? [...acc, String(id)] : acc,
      [],
    );

    return removeChildrenOf(
      flattenedTree,
      activeId ? [activeId, ...collapsedItems] : collapsedItems,
    );
  }, [activeId, items]);
  const projected =
    activeId && overId
      ? getProjection(
          flattenedItems,
          activeId,
          overId,
          offsetLeft,//yatay eksende hareketi sağlar
          indentationWidth,
        )
      : null;
 
  const sortedAbc = useMemo(
    () => flattenedItems.map(({ id }) => id),
    [flattenedItems],
  );
  const activeItem = activeId
    ? flattenedItems.find(({ id }) => id === activeId)
    : null;

  return (
    <DndContext
      measuring={measuring}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={sortedAbc} strategy={verticalListSortingStrategy}>
        {flattenedItems.map(({ id, children, collapsed, depth }) => (
          <SortableTreeItem
            key={id}
            id={id}
            value={String(id)}
            depth={id === activeId && projected ? projected.depth : depth}
            indentationWidth={indentationWidth}
            indicator={indicator}
            collapsed={Boolean(collapsed && children.length)}
            onCollapse={
              collapsible && children.length
                ? () => handleCollapse(id)
                : undefined
            }
            onRemove={removable ? () => handleRemove(id) : undefined}
          />
        ))}
      </SortableContext>
    </DndContext>
  );
  //sürükleme işlevi başlar
  function handleDragStart({ active: { id: activeId } }: DragStartEvent) {
    setActiveId(activeId);
    setOverId(activeId);

    const activeItem = flattenedItems.find(({ id }) => id === activeId);
    //flattened items ağaç yapısındaki bütün öğelerin tek bir düzeyde bulunduğu halini içerir
    if (activeItem) {
      setCurrentPosition({
        parentId: activeItem.parentId,
        overId: activeId,
      });
    }

    document.body.style.setProperty("cursor", "grabbing");
  }

  function handleDragMove({ delta }: DragMoveEvent) {


    setOffsetLeft(delta.x);
  }
  //öğenin bırakılacağı konuma fare getirildiğinde çalışır
  function handleDragOver({ over }: DragOverEvent) {
    setOverId(over?.id ?? null);
  }
  //sürükleme işlevi biter
  function handleDragEnd({ active, over }: DragEndEvent) {
    resetState();

    if (projected && over) {
      const { depth, parentId } = projected;
      //sürüklenen öğenin derinlik genişlik bilgileri
      const clonedItems: FlattenedItem[] = JSON.parse(
        JSON.stringify(flattenTree(items)),
        //mevcut ağaç yapısının değiştirilmeden kopyasını alır.
      );

      // öğelerin dizideki konumlarını bulur
      const overIndex = clonedItems.findIndex(({ id }) => id === over.id);
      const activeIndex = clonedItems.findIndex(({ id }) => id === active.id);
      const activeTreeItem = clonedItems[activeIndex];

      clonedItems[activeIndex] = { ...activeTreeItem, depth, parentId };
        // sürüklenen ögenin depth ve parentId değerini günceller.
        // sürüklenen ögeyeni konumuna göre clonedItems dizine eklenir
      const sortedItems = arrayMove(clonedItems, activeIndex, overIndex);
      const newItems = buildTree(sortedItems);

      setItems(newItems);
    }
  }

  function handleDragCancel() {
    resetState();
  }

  function resetState() {
    setOverId(null);
    setActiveId(null);
    setOffsetLeft(0);
    setCurrentPosition(null);

    document.body.style.setProperty("cursor", "");
  }

  function handleRemove(id: UniqueIdentifier) {
    setItems((items) => removeItem(items, id));
  }

  function handleCollapse(id: UniqueIdentifier) {
    setItems((items) =>
      setProperty(items, id, "collapsed", (value) => {
        return !value;
      }),
    );
  }

}

export function App() {
  return <SortableTree />;
}
