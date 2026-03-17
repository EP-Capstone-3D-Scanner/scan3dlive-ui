import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

export const useThrottledFrame = (callback, maxHz = 30) => {
  const interval = 1 / maxHz
  const acc = useRef(0)

  useFrame((state, delta) => {
    acc.current += delta
    if (acc.current < interval) return
    acc.current -= interval
    
    callback(state, delta)
  })
}