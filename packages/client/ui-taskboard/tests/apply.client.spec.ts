/** Taskboard registrations: the two sidebar foot actions, dictionaries, and teardown. */
import { Context } from '@deepseek-ai/cordis'
import { describe, expect, it } from 'vitest'
import { SlotRegistry } from '@deepseek-ai/dsh-client-runtime/client'
import { LocaleRuntime } from '@deepseek-ai/dsh-client-locale/client'
import { apply, inject } from '@deepseek-ai/dsh-client-ui-taskboard/client'
import { TaskboardEntry, WorkflowEntry } from '../src/client/TaskboardPanel.tsx'

async function bench() {
  const ctx = new Context()
  await ctx.plugin(SlotRegistry).await()
  const locale = new LocaleRuntime(ctx)
  ctx.provide('locale', locale)
  return { ctx, slots: ctx.get('slots') as SlotRegistry, locale }
}

/** Declare the sidebar shell the way ui-sidebar's entry does. */
function declare(slots: SlotRegistry): () => void {
  return slots.register(
    {
      name: 'root',
      children: {
        'sidebar.workspaces': { kind: 'single', scope: 'root' },
        'sidebar.settings': { kind: 'single', scope: 'root' },
        'sidebar.footer.action': { kind: 'list', scope: 'root' },
      },
    } as never,
    () => null,
  )
}

describe('ui-taskboard apply', () => {
  it('declares only the services it uses', () => {
    expect(inject).toEqual(['slots', 'locale'])
  })

  it('registers both foot actions once the sidebar declares the hole', async () => {
    const b = await bench()
    declare(b.slots)
    await b.ctx.plugin({ inject: [...inject], apply }).await()
    const entries = b.slots.entries('sidebar.footer.action')
    expect(entries).toHaveLength(2)
    expect(entries[0]!.component).toBe(TaskboardEntry)
    expect(entries[0]!.options).toMatchObject({ id: 'taskboard', order: 0 })
    expect(entries[0]!.locale).toBe('taskboard')
    expect(entries[1]!.component).toBe(WorkflowEntry)
    expect(entries[1]!.options).toMatchObject({ id: 'taskboard-workflow', order: 1 })
    expect(entries[1]!.locale).toBe('taskboard')
  })

  it('waits for a declaration that arrives after apply', async () => {
    const b = await bench()
    await b.ctx.plugin({ inject: [...inject], apply }).await()
    expect(b.slots.entries('sidebar.footer.action')).toEqual([])
    declare(b.slots)
    await Promise.resolve()
    expect(b.slots.entries('sidebar.footer.action')).toHaveLength(2)
  })

  it('registers the zh/en taskboard dictionaries and frees the seats on teardown', async () => {
    const b = await bench()
    declare(b.slots)
    const fiber = b.ctx.plugin({ inject: [...inject], apply })
    await fiber.await()
    expect(b.locale.bind('taskboard')('entry')).toBe('任务面板')
    b.locale.setLocale('en')
    expect(b.locale.bind('taskboard')('entry')).toBe('Taskboard')
    b.locale.setLocale('zh')
    await fiber.dispose()
    expect(b.slots.entries('sidebar.footer.action')).toHaveLength(0)
    expect(() => b.locale.register('taskboard', 'zh', {})).not.toThrow()
    expect(() => b.locale.register('taskboard', 'en', {})).not.toThrow()
  })
})
