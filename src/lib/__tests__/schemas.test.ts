import { describe, expect, it } from 'vitest'
import { can } from '../permissions'
import {
  callbackUrlSchema,
  commentCreateSchema,
  commentsPageSchema,
  commentsQuerySchema,
  commentUpdateSchema,
  parsePositiveInt,
} from '../schemas'
import { adminUser, regularUser } from '@/test/data'

// Unit-тесты: проверяют отдельные функции без рендера интерфейса

describe('схемы комментария', () => {
  it('создание: trim, приведение postId к числу и запрет лишних полей', () => {
    expect(commentCreateSchema.parse({ body: '  Привет всем  ', postId: '5' })).toEqual({ body: 'Привет всем', postId: 5 })
    expect(commentCreateSchema.safeParse({ body: 'Привет всем', postId: 5, user: { id: 1 } }).success).toBe(false)
  })

  it('изменение: нужно хотя бы одно поле, лайки не отрицательные', () => {
    expect(commentUpdateSchema.safeParse({}).success).toBe(false)
    expect(commentUpdateSchema.safeParse({ likes: -1 }).success).toBe(false)
    expect(commentUpdateSchema.parse({ likes: 3 })).toEqual({ likes: 3 })
  })
})

describe('внешние границы', () => {
  it('ответ DummyJSON без нужных полей не проходит проверку', () => {
    expect(commentsPageSchema.safeParse({ comments: [{ id: 1 }], total: 1, skip: 0, limit: 1 }).success).toBe(false)
  })

  it('параметры URL: значения по умолчанию и ограничения', () => {
    expect(commentsQuerySchema.parse({})).toEqual({ skip: 0, limit: 10, postId: null })
    expect(commentsQuerySchema.parse({ skip: '20', postId: '6' })).toEqual({ skip: 20, limit: 10, postId: 6 })
    expect(commentsQuerySchema.safeParse({ limit: '1000' }).success).toBe(false)
    expect(parsePositiveInt('42')).toBe(42)
    expect(parsePositiveInt('-1')).toBeNull()
    expect(parsePositiveInt('1.5')).toBeNull()
  })

  it('callbackUrl: внешние адреса заменяются на "/" (защита от открытого редиректа)', () => {
    expect(callbackUrlSchema.parse('/comments/new')).toBe('/comments/new')
    expect(callbackUrlSchema.parse('https://evil.example')).toBe('/')
    expect(callbackUrlSchema.parse('//evil.example')).toBe('/')
    expect(callbackUrlSchema.parse(undefined)).toBe('/')
  })
})

describe('права ролей', () => {
  it('удаление доступно только администратору', () => {
    expect(can(null, 'comment:update')).toBe(false)
    expect(can(regularUser, 'comment:update')).toBe(true)
    expect(can(regularUser, 'comment:delete')).toBe(false)
    expect(can(adminUser, 'comment:delete')).toBe(true)
  })
})
