import fragmentShader from '@assets/shader/NebulaBackground.frag'
import vertexShader from '@assets/shader/NebulaBackground.vert'
import { cyrb128, sfc32 } from '@utils/crypto'
import { easeOutQuart } from '@utils/math'
import { createProgram, createShader, resize } from '@utils/shader'

import { useEffect, useRef, useState } from 'react'
import '@assets/css/NebulaBackground.css'

const ANIMATION_IDLE_DURATION = 1000
const ANIMATION_CHANGING_DURATION = 500

export default function NebulaBackground() {
    const [selectedColor, setSelectedColor] = useState<'alpha' | 'beta' | 'gamma'>('alpha')

    const seed = cyrb128(`golden-ratio ${selectedColor}`)
    const rand = sfc32(...seed)

    const hueOffsetBase = rand()

    const canvas = useRef<HTMLCanvasElement>(null)
    const hueOffset = useRef<{
        current: number
        target: number
        start: number
        startedAt: DOMHighResTimeStamp | null
    }>({
        current: hueOffsetBase,
        target: hueOffsetBase,
        start: hueOffsetBase,
        startedAt: null,
    })

    useEffect(() => {
        document.body.style.setProperty('--hue-offset', `${hueOffsetBase}`)

        hueOffset.current.target = hueOffsetBase // the new one
        hueOffset.current.start = hueOffset.current.current
        hueOffset.current.startedAt = null
    }, [hueOffsetBase])

    useEffect(() => {
        if (!canvas.current)
            return

        let running = true

        const gl = canvas.current.getContext('webgl2')
        if (!gl)
            return

        const vertex = createShader(gl, gl.VERTEX_SHADER, vertexShader)
        const fragment = createShader(gl, gl.FRAGMENT_SHADER, fragmentShader)
        const program = createProgram(gl, vertex, fragment)

        const positionAttributeLocation = gl.getAttribLocation(program, 'a_position')
        const positionBuffer = gl.createBuffer()

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

        const positions = [-1, -1, -1, 1, 1, -1, 1, 1]
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

        const vao = gl.createVertexArray()
        gl.bindVertexArray(vao)
        gl.enableVertexAttribArray(positionAttributeLocation)
        gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0)
        gl.useProgram(program)

        gl.enable(gl.BLEND)
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
        gl.clearColor(0, 0, 0, 0)

        const render = (timestamp: DOMHighResTimeStamp) => {
            resize(gl, canvas)

            if (hueOffset.current.target !== hueOffset.current.current) {
                if (hueOffset.current.startedAt === null)
                    hueOffset.current.startedAt = timestamp

                const t = Math.min((timestamp - hueOffset.current.startedAt) / ANIMATION_CHANGING_DURATION, 1)
                const progress = easeOutQuart(t)

                let delta = hueOffset.current.target - hueOffset.current.start

                if (delta > 0.5)
                    delta -= 1.0
                else if (delta < -0.5)
                    delta += 1.0

                const currentHue = hueOffset.current.start + (delta * progress)

                hueOffset.current.current = (currentHue % 1.0 + 1.0) % 1.0

                if (t === 1.0) {
                    hueOffset.current.current = hueOffset.current.target
                }
            }

            gl.clear(gl.COLOR_BUFFER_BIT)
            gl.uniform1f(gl.getUniformLocation(program, 'time'), timestamp / ANIMATION_IDLE_DURATION)
            gl.uniform1f(gl.getUniformLocation(program, 'hueOffset'), hueOffset.current.current)
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

            if (running)
                requestAnimationFrame(render)
        }
        requestAnimationFrame(render)

        return () => {
            running = false
        }
    }, [canvas, hueOffset])

    return (
        <div className="flex flex-col">
            <canvas className="mb-3 h-full w-full" ref={canvas}></canvas>
            <div className="flex flex-row items-center justify-between">
                <div className="">
                    <p className="font-mono">
                        inspired by
                        {' '}
                        <a href="https://github.com/Erdragh" className="text-[--tint-color] underline underline-offset-5">@Erdragh</a>
                    </p>
                </div>
                <div className="flex flex-row gap-3">
                    <button className="p-2 border border-default rounded-sm hover:border-hover hover:cursor-pointer" onClick={() => setSelectedColor('alpha')}>Alpha</button>
                    <button className="p-2 border border-default rounded-sm hover:border-hover hover:cursor-pointer" onClick={() => setSelectedColor('beta')}>Beta</button>
                    <button className="p-2 border border-default rounded-sm hover:border-hover hover:cursor-pointer" onClick={() => setSelectedColor('gamma')}>Gamma</button>
                </div>
            </div>
        </div>
    )
}
