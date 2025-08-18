'use client'

import { cn } from '@/lib/utils'
import { EmptyStateProps } from '@/types/components'

export function EmptyState({ title, description, icon, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center p-8 text-center', className)}>
      {icon && <div className="mb-4 text-muted-foreground">{icon}</div>}
      <h3 className="text-lg font-medium">{title}</h3>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
    </div>
  )
}