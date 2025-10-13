import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-sans antialiased font-medium text-center duration-300 ease-in select-none align-middle ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed active:scale-95 [&_svg]:pointer-events-none [&_svg]:shrink-0 [a]:no-underline!",
  {
    variants: {
      variant: {
        default: "relative border border-stone-900 bg-gradient-to-b from-stone-700 to-stone-800 text-stone-50 shadow-sm hover:shadow-md hover:from-stone-800 hover:to-stone-800 hover:text-stone-50 after:absolute after:inset-0 after:rounded-[inherit] after:pointer-events-none after:shadow-[inset_0_1px_0px_rgba(255,255,255,0.25),inset_0_-2px_0px_rgba(0,0,0,0.35)]",
        destructive:
          "relative border border-red-900 bg-gradient-to-b from-red-600 to-red-700 text-white shadow-sm hover:shadow-md hover:from-red-700 hover:to-red-700 hover:text-white after:absolute after:inset-0 after:rounded-[inherit] after:pointer-events-none after:shadow-[inset_0_1px_0px_rgba(255,255,255,0.25),inset_0_-2px_0px_rgba(0,0,0,0.35)]",
        outline:
          "border-2 border-stone-200 bg-white text-stone-900 hover:bg-stone-50 hover:border-stone-300 hover:text-stone-900 transition-colors",
        secondary:
          "relative border border-blue-900 bg-gradient-to-b from-blue-600 to-blue-700 text-white shadow-sm hover:shadow-md hover:from-blue-700 hover:to-blue-700 hover:text-white after:absolute after:inset-0 after:rounded-[inherit] after:pointer-events-none after:shadow-[inset_0_1px_0px_rgba(255,255,255,0.25),inset_0_-2px_0px_rgba(0,0,0,0.35)]",
        ghost: "text-stone-900 hover:bg-stone-100 hover:text-stone-900 transition-colors",
        link: "text-stone-900 hover:text-stone-700 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2 text-sm rounded-lg",
        sm: "h-9 px-3 py-2 text-sm rounded-lg",
        lg: "h-12 px-8 py-2.5 text-base rounded-lg",
        icon: "h-10 w-10 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
