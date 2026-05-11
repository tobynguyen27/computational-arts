import type { RefObject } from 'react'

export function createShader(gl: WebGL2RenderingContext, type: GLenum, source: string): WebGLShader {
    const shader = gl.createShader(type)

    if (!shader)
        throw new Error('Failed to create Shader')

    gl.shaderSource(shader, source)
    gl.compileShader(shader)

    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
    if (success) {
        return shader
    }
    else {
        console.error(gl.getShaderInfoLog(shader))
        gl.deleteShader(shader)

        throw new Error('Failed to compile shader, check Browser Console for details.')
    }
}

export function createProgram(gl: WebGL2RenderingContext, vertex: WebGLShader, fragment: WebGLShader): WebGLProgram {
    const program = gl.createProgram()

    if (!program)
        throw new Error('Failed to create Program')

    gl.attachShader(program, vertex)
    gl.attachShader(program, fragment)
    gl.linkProgram(program)

    const success = gl.getProgramParameter(program, gl.LINK_STATUS)

    if (success) {
        return program
    }
    else {
        console.error(gl.getProgramInfoLog(program))
        gl.deleteProgram(program)

        throw new Error('Failed to link program, check Browser Console for details.')
    }
}

export function resize(gl: WebGL2RenderingContext, canvas: RefObject<HTMLCanvasElement | null>) {
    if (!canvas.current)
        throw new Error('Cannot resize a non existent canvas')

    const rect = canvas.current.getBoundingClientRect()
    const dpr = window.devicePixelRatio

    canvas.current.width = Math.floor(rect.width * dpr)
    canvas.current.height = Math.floor(rect.height * dpr)

    gl.viewport(0, 0, rect.width, rect.height)
}
