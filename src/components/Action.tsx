// src/components/Action.tsx

import React, { forwardRef, CSSProperties } from "react";

export interface Props extends React.HTMLAttributes<HTMLButtonElement> {
  active?: {
    //aktif durumdan kullanılacak stil
    fill: string;
    background: string;
  };
  cursor?: CSSProperties["cursor"];
}

export const Action = forwardRef<HTMLButtonElement, Props>(
  ({ active, className, cursor, style, ...props }, ref) => {
    return (
      <button
        ref={ref}
        {...props}
        tabIndex={0}
        style={
          {
            ...style,
            cursor,
            "--fill": active?.fill,
            "--background": active?.background
          } as CSSProperties
        }
      />
    );
  }
);
