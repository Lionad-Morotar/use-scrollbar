import { describe, expect, it } from 'vitest'
import { findScrollElement, notEmpty, safe, safePrecicion, safeRatio, SCROLLBAR_GAP } from '../src/hooks/useScrollbar/utils'

// 特征锁定测试（characterization tests）：固化迁移前的既有行为，
// 作为后续工具链/重构改动的回归防线；断言描述"系统当前做什么"而非实现细节

describe('notEmpty', () => {
  it('视 null 与 undefined 为空', () => {
    expect(notEmpty(null)).toBe(false)
    expect(notEmpty(undefined)).toBe(false)
  })

  it('视 0、空字符串、false 为非空', () => {
    expect(notEmpty(0)).toBe(true)
    expect(notEmpty('')).toBe(true)
    expect(notEmpty(false)).toBe(true)
  })
})

describe('safeRatio', () => {
  it('将比例钳制在 [0, 1]', () => {
    expect(safeRatio(0.5)).toBe(0.5)
    expect(safeRatio(2)).toBe(1)
    expect(safeRatio(-1)).toBe(0)
  })

  it('视 NaN 为 0', () => {
    expect(safeRatio(Number.NaN)).toBe(0)
  })
})

describe('safe', () => {
  it('视负数与 NaN 为 0，其余原样返回', () => {
    expect(safe(-5)).toBe(0)
    expect(safe(Number.NaN)).toBe(0)
    expect(safe(3)).toBe(3)
  })
})

describe('safePrecicion', () => {
  it('保留三位小数', () => {
    expect(safePrecicion(1.23456)).toBe(1.235)
    expect(safePrecicion()).toBe(0)
  })
})

describe('scrollbar gap 常量', () => {
  it('滚动条间隙常量为 4', () => {
    expect(SCROLLBAR_GAP).toBe(4)
  })
})

describe('findScrollElement', () => {
  function defineScrollable(el: HTMLElement, scrollHeight: number, clientHeight: number) {
    Object.defineProperty(el, 'scrollHeight', { value: scrollHeight, configurable: true })
    Object.defineProperty(el, 'clientHeight', { value: clientHeight, configurable: true })
  }

  it('返回第一个 scrollHeight 超出 clientHeight 的直接子元素', () => {
    const root = document.createElement('div')
    const a = document.createElement('div')
    const b = document.createElement('div')
    defineScrollable(a, 50, 50)
    defineScrollable(b, 200, 100)
    root.append(a, b)
    expect(findScrollElement(root)).toBe(b)
  })

  it('直接子元素不可滚动时递归深入查找', () => {
    const root = document.createElement('div')
    const mid = document.createElement('div')
    const deep = document.createElement('div')
    defineScrollable(mid, 50, 50)
    defineScrollable(deep, 300, 100)
    mid.appendChild(deep)
    root.appendChild(mid)
    expect(findScrollElement(root)).toBe(deep)
  })

  it('全部子树都不可滚动时返回 null', () => {
    const root = document.createElement('div')
    const a = document.createElement('div')
    defineScrollable(a, 10, 10)
    root.appendChild(a)
    expect(findScrollElement(root)).toBeNull()
  })
})
