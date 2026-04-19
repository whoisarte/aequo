import { ReactNode, CSSProperties } from 'react'

interface HeadingProps {
  level?: 1 | 2 | 3 | 4
  children: ReactNode
  className?: string
  style?: CSSProperties
}

const sizesByLevel = {
  1: { fontSize: '20px', fontWeight: 600 },
  2: { fontSize: '16px', fontWeight: 600 },
  3: { fontSize: '14px', fontWeight: 600 },
  4: { fontSize: '13px', fontWeight: 600 },
}

const ElementByLevel = {
  1: 'h1',
  2: 'h2',
  3: 'h3',
  4: 'h4',
} as const

export default function Heading({
  level = 1,
  children,
  className,
  style,
}: HeadingProps) {
  const Element = ElementByLevel[level]
  const styles = {
    ...sizesByLevel[level],
    color: 'var(--text-primary)',
    margin: 0,
    padding: 0,
    ...style,
  }

  return (
    <Element style={styles} className={className}>
      {children}
    </Element>
  )
}
