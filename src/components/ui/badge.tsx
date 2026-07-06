import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary:
          "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive:
          "bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20",
        "destructive-solid":
          "bg-red-500 text-white dark:bg-red-600 [a]:hover:bg-red-600",
        outline:
          "border-border text-foreground [a]:hover:bg-accent [a]:hover:text-foreground",
        ghost:
          "hover:bg-accent hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        warning:
          "bg-amber-500/15 text-amber-500 dark:bg-amber-500/20 dark:text-amber-400 [a]:hover:bg-amber-500/25",
        success:
          "bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20 dark:text-emerald-400 [a]:hover:bg-emerald-500/20",
      },
      size: {
        sm: "h-4 min-w-4 px-1.5 py-px text-micro font-bold [&>svg]:size-2.5!",
        default: "h-5 px-2 py-0.5 text-xs font-medium [&>svg]:size-3!",
        lg: "h-6 px-3 py-1 text-sm font-medium [&>svg]:size-3.5!",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  size = "default",
  color,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & {
    asChild?: boolean
    color?: string
  }) {
  const Comp = asChild ? Slot.Root : "span"
  const style = color
    ? { backgroundColor: `${color}20`, color, borderColor: `${color}30` }
    : undefined

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant, size }), className)}
      style={style}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
