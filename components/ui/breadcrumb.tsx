import * as React from "react"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export interface BreadcrumbProps extends React.ComponentPropsWithoutRef<"nav"> {
  separator?: React.ReactNode
}

export interface BreadcrumbItemProps extends React.ComponentPropsWithoutRef<"li"> {
  isCurrentPage?: boolean
}

export interface BreadcrumbLinkProps extends React.ComponentPropsWithoutRef<"a"> {
  asChild?: boolean
}

const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  ({ className, separator = <ChevronRight className="h-4 w-4" />, ...props }, ref) => {
    return <nav ref={ref} aria-label="breadcrumb" className={cn("flex", className)} {...props} />
  },
)
Breadcrumb.displayName = "Breadcrumb"

const BreadcrumbList = React.forwardRef<HTMLOListElement, React.ComponentPropsWithoutRef<"ol">>(
  ({ className, ...props }, ref) => {
    return (
      <ol
        ref={ref}
        className={cn("flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground", className)}
        {...props}
      />
    )
  },
)
BreadcrumbList.displayName = "BreadcrumbList"

const BreadcrumbItem = React.forwardRef<HTMLLIElement, BreadcrumbItemProps>(
  ({ className, isCurrentPage, ...props }, ref) => {
    return (
      <li
        ref={ref}
        className={cn("inline-flex items-center gap-1.5", className)}
        aria-current={isCurrentPage ? "page" : undefined}
        {...props}
      />
    )
  },
)
BreadcrumbItem.displayName = "BreadcrumbItem"

const BreadcrumbLink = React.forwardRef<HTMLAnchorElement, BreadcrumbLinkProps>(
  ({ className, asChild = false, ...props }, ref) => {
    return (
      <a
        ref={ref}
        className={cn(
          "transition-colors hover:text-foreground",
          props.href && !asChild ? "underline underline-offset-4" : "",
          props["aria-current"] ? "font-medium text-foreground pointer-events-none" : "",
          className,
        )}
        {...props}
      />
    )
  },
)
BreadcrumbLink.displayName = "BreadcrumbLink"

const BreadcrumbSeparator = React.forwardRef<HTMLSpanElement, React.ComponentPropsWithoutRef<"span">>(
  ({ className, ...props }, ref) => {
    return <span ref={ref} className={cn("text-muted-foreground", className)} {...props} />
  },
)
BreadcrumbSeparator.displayName = "BreadcrumbSeparator"

const BreadcrumbEllipsis = React.forwardRef<HTMLSpanElement, React.ComponentPropsWithoutRef<"span">>(
  ({ className, ...props }, ref) => {
    return (
      <span ref={ref} className={cn("flex h-9 w-9 items-center justify-center", className)} {...props}>
        <span className="h-1 w-1 rounded-full bg-muted-foreground" />
        <span className="mx-0.5 h-1 w-1 rounded-full bg-muted-foreground" />
        <span className="h-1 w-1 rounded-full bg-muted-foreground" />
        <span className="sr-only">More</span>
      </span>
    )
  },
)
BreadcrumbEllipsis.displayName = "BreadcrumbEllipsis"

export { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbEllipsis }

