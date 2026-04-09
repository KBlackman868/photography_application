import React, { ElementType, HTMLAttributes, ReactNode, RefObject } from 'react'
import { motion, useInView, Variants } from 'framer-motion'

interface TimelineContentProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType
  animationNum?: number
  customVariants?: Variants
  timelineRef?: RefObject<HTMLElement | HTMLDivElement | null>
  children?: ReactNode
}

export function TimelineContent({
  as = 'div',
  animationNum = 0,
  customVariants,
  timelineRef,
  children,
  className,
  style,
  ...rest
}: TimelineContentProps) {
  const internalRef = React.useRef<HTMLElement>(null)
  const targetRef = (timelineRef ?? internalRef) as RefObject<Element>
  const isInView = useInView(targetRef, { once: true, margin: '-80px' })

  // Resolve the motion element type for standard HTML elements
  const MotionEl = (motion as unknown as Record<string, React.ElementType>)[as as string] ?? motion.div

  return (
    <MotionEl
      custom={animationNum}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={customVariants}
      className={className}
      style={style}
      {...rest}
    >
      {children}
    </MotionEl>
  )
}
