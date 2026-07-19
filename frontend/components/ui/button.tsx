import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl hover:shadow-indigo-500/40 focus-visible:ring-indigo-500/20",
        primary:
          "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl hover:shadow-indigo-500/40 focus-visible:ring-indigo-500/20",
        accent:
          "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/30 hover:from-cyan-700 hover:to-blue-700 hover:shadow-xl hover:shadow-cyan-500/40 focus-visible:ring-cyan-500/20",
        success:
          "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/30 hover:from-green-700 hover:to-emerald-700 hover:shadow-xl hover:shadow-green-500/40 focus-visible:ring-green-500/20",
        warning:
          "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-500/30 hover:from-amber-700 hover:to-orange-700 hover:shadow-xl hover:shadow-amber-500/40 focus-visible:ring-amber-500/20",
        danger:
          "bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg shadow-rose-500/30 hover:from-rose-700 hover:to-pink-700 hover:shadow-xl hover:shadow-rose-500/40 focus-visible:ring-rose-500/20",
        outline:
          "border-2 border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50 hover:border-neutral-300 focus-visible:ring-neutral-500/20",
        secondary:
          "bg-neutral-100 text-neutral-900 hover:bg-neutral-200 focus-visible:ring-neutral-500/20",
        ghost:
          "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 focus-visible:ring-neutral-500/20",
        link: "text-indigo-600 underline-offset-4 hover:underline hover:text-indigo-700 focus-visible:ring-indigo-500/20",
      },
      size: {
        default: "h-12 px-6",
        sm: "h-10 px-4 text-sm",
        lg: "h-14 px-8 text-base",
        icon: "h-12 w-12",
        "icon-sm": "h-10 w-10",
        "icon-lg": "h-14 w-14",
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
