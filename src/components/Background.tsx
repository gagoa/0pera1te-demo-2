import { useEffect, useRef, useState } from "react"
import CustomCursor from "./CustomCursor"

interface BackgroundProps {
  isChaos?: boolean;
}

export function Background({ isChaos }: BackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const imageRef = useRef<HTMLImageElement | null>(null)
  const animationFrameRef = useRef<number>(0)

  // Handle mouse movement
  const handleMouseMove = (e: MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY })
  }

  // Handle window resize
  const handleResize = () => {
    if (canvasRef.current) {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }
  }

  // Initialize canvas and event listeners
  useEffect(() => {
    handleResize()
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("resize", handleResize)

    // Create image element
    imageRef.current = new Image()
    imageRef.current.src = "/mountain.jpg"
    imageRef.current.crossOrigin = "anonymous"

    // Clean up event listeners
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("resize", handleResize)
      cancelAnimationFrame(animationFrameRef.current)
    }
  }, [])

  // Draw canvas when dimensions or mouse position changes
  useEffect(() => {
    if (!canvasRef.current || !imageRef.current || !dimensions.width) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = dimensions.width
    canvas.height = dimensions.height

    // Function to draw the canvas
    const draw = () => {
      if (!ctx || !imageRef.current) return

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw blurred background
      ctx.filter = "blur(10px)"
      ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height)

      // Draw clear circle around mouse
      const radius = 100
      ctx.filter = "none"
      ctx.globalCompositeOperation = "source-over"

      // Create clipping region for the clear circle
      ctx.save()
      ctx.beginPath()
      ctx.arc(mousePos.x, mousePos.y, radius, 0, Math.PI * 2)
      ctx.clip()

      // Draw the unblurred image in the clipped region
      ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height)
      ctx.restore()

      // Request next frame
      animationFrameRef.current = requestAnimationFrame(draw)
    }

    // Start animation if image is loaded
    if (imageRef.current.complete) {
      draw()
    } else {
      imageRef.current.onload = draw
    }

    return () => {
      cancelAnimationFrame(animationFrameRef.current)
    }
  }, [dimensions, mousePos])

  return (
    <>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full object-cover pointer-events-none" style={{ zIndex: 0 }} />
      <CustomCursor />
    </>
  )
}
