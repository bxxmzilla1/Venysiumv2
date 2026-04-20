const PALETTE = [
  '#e57373', '#f06292', '#ba68c8', '#9575cd',
  '#7986cb', '#64b5f6', '#4dd0e1', '#4db6ac',
  '#81c784', '#aed581', '#ff8a65', '#a1887f',
]

function pickColor(seed: string): string {
  let h = 5381
  for (let i = 0; i < seed.length; i++) {
    h = ((h << 5) + h) ^ seed.charCodeAt(i)
    h = h >>> 0
  }
  return PALETTE[h % PALETTE.length]
}

interface AvatarProps {
  name: string
  size?: number
  className?: string
  online?: boolean
}

export function Avatar({ name, size = 40, className = '', online }: AvatarProps) {
  const char = (name || '?').trim()[0]?.toUpperCase() ?? '?'
  const bg = pickColor(name || '?')
  const fontSize = Math.round(size * 0.42)

  return (
    <div className={`relative flex-shrink-0 ${className}`} style={{ width: size, height: size }}>
      <div
        className="flex items-center justify-center rounded-full w-full h-full select-none font-semibold text-white"
        style={{ background: bg, fontSize }}
      >
        {char}
      </div>
      {online && (
        <span
          className="absolute bottom-0 right-0 rounded-full bg-green-400 border-2 border-[#17212b]"
          style={{ width: Math.max(10, size * 0.26), height: Math.max(10, size * 0.26) }}
        />
      )}
    </div>
  )
}
