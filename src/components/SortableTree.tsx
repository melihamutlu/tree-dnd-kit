// src/components/SortableTree.tsx    melihamutlu
import React, { CSSProperties } from "react";
import type { UniqueIdentifier } from "@dnd-kit/core";
import { AnimateLayoutChanges, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TreeItem, Props as TreeItemProps } from "./TreeItem";

interface Props extends TreeItemProps {
  id: UniqueIdentifier;
}

// animasyon değişiklikleri yönetmek için kullanılan fonksiyon
const animateLayoutChanges: AnimateLayoutChanges = ({
  isSorting, //parametre alır
  wasDragging //animasyon durumunu belirler 
}) => (isSorting || wasDragging ? false : true);


// DND işleminin gerçekleştiği fpnsiyondur. useSortable hook u sürükle bırak işlemnini sağlar
export function SortableTreeItem({ id, depth, ...props }: Props) {

  const {
    attributes,// sürüklene öğeye atanacak özellikler
    isDragging,// sürüklendiği durum
    isSorting,//sıralama işleminin gerçekleşme durumu
    listeners,//
    setDraggableNodeRef,//sürüklenen öğenin ref ayarlama
    setDroppableNodeRef,//bırakılan öğenin ref ayarlama
    transform,//ögenin değişimini belirtir
    transition//ögenin geçiş animasyonunu belirtir
  } = useSortable({
    id,
    animateLayoutChanges
  });
  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition
  };

  return (
    <TreeItem
      ref={setDraggableNodeRef}//sürüklenen öğenin referansı atanır
      wrapperRef={setDroppableNodeRef}//bırakılan öğenin ref atanır
      style={style}
      depth={depth}
      ghost={isDragging}//öğenin sürüklenme durumu
      disableInteraction={isSorting}//Sıralama işlemi(isSorting) sırasında etkileşimin devre dışı bırakılmasını belirler
      handleProps={{
        ...attributes,
        ...listeners
      }}
      {...props}//diğer tüm propslar aktarılır
    />
  );
}