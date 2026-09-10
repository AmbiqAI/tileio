// SPDX-License-Identifier: BSD-3-Clause
// Copyright (c) 2026 Ambiq

import { useEffect, useMemo, useRef } from 'react'
import { Box, type BoxProps, useTheme } from '@mui/material'
import type { PaletteMode } from '@mui/material'

type HexagonBackgroundProps = BoxProps & {
  hexagonSize?: number
  hexagonMargin?: number
  paletteMode?: PaletteMode
}

function drawHex(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath()
  for (let i = 0; i < 6; i++) {
    const angle = Math.PI / 2 + i * (Math.PI / 3) // pointy top
    const vx = x + r * Math.cos(angle)
    const vy = y + r * Math.sin(angle)
    if (i === 0) {
      ctx.moveTo(vx, vy)
    } else {
      ctx.lineTo(vx, vy)
    }
  }
  ctx.closePath()
}

export function HoneycombBackground({
  hexagonSize = 80,
  hexagonMargin = 4,
  paletteMode,
  sx,
  ...props
}: HexagonBackgroundProps) {
  const theme = useTheme()
  const mode = paletteMode ?? theme.palette.mode
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const colors = useMemo(() => {
    const lightStroke = 'rgba(100,116,139,0.06)'
    const darkStroke = 'rgba(148,163,184,0.05)'
    return {
      stroke: mode === 'dark' ? darkStroke : lightStroke,
      fill: 'transparent',
      background: theme.palette.background.default,
    }
  }, [mode, theme.palette.background.default])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dpr = window.devicePixelRatio || 1
    const resize = () => {
      const { clientWidth, clientHeight } = canvas
      canvas.width = clientWidth * dpr
      canvas.height = clientHeight * dpr
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.save()
      ctx.scale(dpr, dpr)
      ctx.clearRect(0, 0, clientWidth, clientHeight)

      const r = Math.max(10, hexagonSize / 2 - hexagonMargin)
      const width = Math.sqrt(3) * r
      const height = 2 * r
      const horizStep = width
      const vertStep = 1.5 * r

      ctx.strokeStyle = colors.stroke
      ctx.fillStyle = colors.fill
      ctx.lineWidth = 1.2

      let row = 0
      for (let y = -height; y < clientHeight + height; y += vertStep) {
        const offsetX = (row % 2 ? width / 2 : 0) - width
        for (let x = offsetX; x < clientWidth + width; x += horizStep) {
          drawHex(ctx, x, y, r)
          ctx.fill()
          ctx.stroke()
        }
        row += 1
      }

      ctx.restore()
    }

    resize()
    window.addEventListener('resize', resize)
    return () => {
      window.removeEventListener('resize', resize)
    }
  }, [colors.fill, colors.stroke, hexagonMargin, hexagonSize])

  return (
    <Box
      {...props}
      sx={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        background: colors.background,
        ...sx,
      }}
    >
      <Box
        component="canvas"
        ref={canvasRef}
        sx={{
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />
    </Box>
  )
}
