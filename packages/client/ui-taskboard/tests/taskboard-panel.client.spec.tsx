// @vitest-environment jsdom
/** Taskboard entries + dock behavior: trigger, toggle, offline state, retry, close. */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import {
  TaskboardEntry, WorkflowEntry, TASKBOARD_URL, TASKBORD_WORKFLOW_URL,
  type TaskboardEntryProps,
} from '../src/client/TaskboardPanel.tsx'
import { en } from '../src/client/locales.ts'

// English-dictionary translate stub: the components render the same copy the
// assertions below query by accessible name.
const t: TaskboardEntryProps['t'] = key => (en as Record<string, string>)[key] ?? key

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

function stubFetch(impl: () => Promise<Response> | Promise<never>) {
  vi.stubGlobal('fetch', vi.fn(impl))
}

function mountEntry(wide = true) {
  return render(<TaskboardEntry wide={wide} t={t} />)
}

describe('TaskboardEntry', () => {
  it('renders the wide row with icon and label', () => {
    mountEntry(true)
    const button = screen.getByRole('button', { name: 'Taskboard' })
    expect(button.getAttribute('aria-expanded')).toBe('false')
    expect(button.getAttribute('aria-controls')).toBe('dsh-taskboard-panel')
  })

  it('renders an icon-only rail button when collapsed', () => {
    mountEntry(false)
    // The rail button is the only button in the tree; no visible label text.
    const button = screen.getByRole('button')
    expect(button.textContent).toBe('')
  })

  it('opens the docked panel on click, toggles closed on a second click', async () => {
    stubFetch(() => Promise.resolve(new Response(null, { status: 200 })))
    mountEntry(true)
    const entry = screen.getByRole('button', { name: 'Taskboard' })
    fireEvent.click(entry)
    const dock = await screen.findByRole('complementary', { name: 'Taskboard' })
    expect(within(dock).getByText('Taskboard')).toBeTruthy()
    // The service answered: the embedded frame mounts.
    await waitFor(() => {
      expect(within(dock).getByTitle('Taskboard').getAttribute('src')).toBe(TASKBOARD_URL)
    })
    // Clicking the entry again closes the tab.
    fireEvent.click(screen.getByRole('button', { name: 'Taskboard' }))
    await waitFor(() => {
      expect(screen.queryByRole('complementary')).toBeNull()
    })
  })

  it('closes via the header close button', async () => {
    stubFetch(() => Promise.resolve(new Response(null, { status: 200 })))
    mountEntry(true)
    fireEvent.click(screen.getByRole('button', { name: 'Taskboard' }))
    const dock = await screen.findByRole('complementary', { name: 'Taskboard' })
    fireEvent.click(within(dock).getByRole('button', { name: 'Close' }))
    await waitFor(() => {
      expect(screen.queryByRole('complementary')).toBeNull()
    })
  })

  it('shows the offline state when the service is unreachable and recovers on retry', async () => {
    let reachable = false
    stubFetch(() => (reachable
      ? Promise.resolve(new Response(null, { status: 200 }))
      : Promise.reject(new TypeError('Failed to fetch'))))
    mountEntry(true)
    fireEvent.click(screen.getByRole('button', { name: 'Taskboard' }))
    const dock = await screen.findByRole('complementary', { name: 'Taskboard' })
    expect(await within(dock).findByText('Taskboard service is not running')).toBeTruthy()
    expect(within(dock).queryByTitle('Taskboard')).toBeNull()
    reachable = true
    fireEvent.click(within(dock).getByRole('button', { name: 'Retry' }))
    await waitFor(() => {
      expect(within(dock).getByTitle('Taskboard').getAttribute('src')).toBe(TASKBOARD_URL)
    })
  })

  it('closes on Escape', async () => {
    stubFetch(() => Promise.resolve(new Response(null, { status: 200 })))
    mountEntry(true)
    fireEvent.click(screen.getByRole('button', { name: 'Taskboard' }))
    await screen.findByRole('complementary', { name: 'Taskboard' })
    fireEvent.keyDown(document, { key: 'Escape' })
    await waitFor(() => {
      expect(screen.queryByRole('complementary')).toBeNull()
    })
  })
})

describe('WorkflowEntry', () => {
  it('opens the node-workflow deep link panel', async () => {
    stubFetch(() => Promise.resolve(new Response(null, { status: 200 })))
    render(<WorkflowEntry wide t={t} />)
    const entry = screen.getByRole('button', { name: 'Workflow' })
    expect(entry.getAttribute('aria-controls')).toBe('dsh-taskboard-workflow-panel')
    fireEvent.click(entry)
    const dock = await screen.findByRole('complementary', { name: 'Workflow' })
    await waitFor(() => {
      expect(within(dock).getByTitle('Workflow').getAttribute('src')).toBe(TASKBORD_WORKFLOW_URL)
    })
    fireEvent.click(within(dock).getByRole('button', { name: 'Close' }))
    await waitFor(() => {
      expect(screen.queryByRole('complementary')).toBeNull()
    })
  })

  it('shows the offline state when the service is unreachable', async () => {
    stubFetch(() => Promise.reject(new TypeError('Failed to fetch')))
    render(<WorkflowEntry wide t={t} />)
    fireEvent.click(screen.getByRole('button', { name: 'Workflow' }))
    const dock = await screen.findByRole('complementary', { name: 'Workflow' })
    expect(await within(dock).findByText('Taskboard service is not running')).toBeTruthy()
    expect(within(dock).queryByTitle('Workflow')).toBeNull()
  })
})
