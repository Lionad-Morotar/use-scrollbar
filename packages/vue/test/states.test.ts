import { describe, expect, it } from 'vitest'
import getOpts from '../src/hooks/useScrollbar/states'

describe('getOpts', () => {
  it('默认主题为 normal，滚动条偏移量为间隙常量的一半', () => {
    const opts = getOpts()
    expect(opts.theme).toBe('normal')
    expect(opts.offset.x.left).toBe(2)
    expect(opts.offset.x.bottom).toBe(2)
    expect(opts.offset.y.top).toBe(2)
    expect(opts.offset.y.right).toBe(2)
  })

  it('初始化前调用 scrollTo 抛出 uninitial', () => {
    expect(() => getOpts().scrollTo(0, 0)).toThrow('uninitial')
  })

  it('两次调用返回相互独立的实例', () => {
    const a = getOpts()
    const b = getOpts()
    a.theme = 'steam'
    a.isHidden.x = true
    expect(b.theme).toBe('normal')
    expect(b.isHidden.x).toBe(false)
  })
})
