"use client";

import { Dialog as SheetPrimitive } from "@base-ui/react/dialog";
import { XIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/* Base: shadcn/ui (Base UI). Ajustado à identidade: painel carvão, sem radius, sem sombra, fechar com X fino. */

function Sheet(props: SheetPrimitive.Root.Props) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger(props: SheetPrimitive.Trigger.Props) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetOverlay({ className, ...props }: SheetPrimitive.Backdrop.Props) {
  return (
    <SheetPrimitive.Backdrop
      data-slot="sheet-overlay"
      className={cn(
        "bg-carvao/60 fixed inset-0 z-50 transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0",
        className,
      )}
      {...props}
    />
  );
}

function SheetContent({
  className,
  children,
  side = "right",
  rotuloFechar = "Fechar menu",
  ...props
}: SheetPrimitive.Popup.Props & { side?: "right" | "left"; rotuloFechar?: string }) {
  return (
    <SheetPrimitive.Portal>
      <SheetOverlay />
      <SheetPrimitive.Popup
        data-slot="sheet-content"
        data-side={side}
        className={cn(
          "bg-carvao text-neutro border-cinza/25 fixed inset-y-0 z-50 flex h-full w-[85vw] max-w-[420px] flex-col transition duration-300 ease-out data-ending-style:opacity-0 data-starting-style:opacity-0",
          side === "right"
            ? "right-0 border-l data-ending-style:translate-x-10 data-starting-style:translate-x-10"
            : "left-0 border-r data-ending-style:-translate-x-10 data-starting-style:-translate-x-10",
          className,
        )}
        {...props}
      >
        {children}
        <SheetPrimitive.Close
          data-slot="sheet-close"
          aria-label={rotuloFechar}
          className="text-neutro hover:text-verde absolute top-3.5 right-[calc(6vw-10px)] inline-flex h-11 w-11 items-center justify-center"
        >
          <XIcon size={24} strokeWidth={1.5} aria-hidden="true" />
        </SheetPrimitive.Close>
      </SheetPrimitive.Popup>
    </SheetPrimitive.Portal>
  );
}

function SheetTitle({ className, ...props }: SheetPrimitive.Title.Props) {
  return <SheetPrimitive.Title data-slot="sheet-title" className={cn("text-base font-medium", className)} {...props} />;
}

function SheetBody({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="sheet-body" className={cn("flex flex-1 flex-col", className)} {...props} />;
}

export { Sheet, SheetTrigger, SheetContent, SheetTitle, SheetBody };
