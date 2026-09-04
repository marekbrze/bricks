import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { Achievement } from '../types/path'

function AchievementRow({
  achievement,
  onToggle,
  onEdit,
  onDelete,
}: {
  achievement: Achievement
  onToggle: (achieved: boolean) => void
  onEdit: (title: string) => void
  onDelete: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(achievement.title)
  const achieved = achievement.state === 'achieved'

  const commit = () => {
    const t = draft.trim()
    if (t && t !== achievement.title) onEdit(t)
    else setDraft(achievement.title)
    setEditing(false)
  }

  return (
    <li className="group flex items-center gap-3 py-1.5">
      <Checkbox
        checked={achieved}
        onCheckedChange={(value) => onToggle(value)}
        aria-label={
          achieved ? `Mark “${achievement.title}” not achieved` : `Mark “${achievement.title}” achieved`
        }
      />
      {editing ? (
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit()
            if (e.key === 'Escape') {
              setDraft(achievement.title)
              setEditing(false)
            }
          }}
          // eslint-disable-next-line jsx-a11y/no-autofocus -- focus follows the user into inline edit mode
          autoFocus
          aria-label={`Edit achievement “${achievement.title}”`}
          className="h-7"
        />
      ) : (
        <button
          type="button"
          onClick={() => {
            setDraft(achievement.title)
            setEditing(true)
          }}
          className={cn(
            'flex-1 rounded-sm text-left text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
            achieved && 'text-muted-foreground line-through',
          )}
        >
          {achievement.title}
        </button>
      )}
      {achieved && achievement.achievedOn && !editing && (
        <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
          {achievement.achievedOn}
        </span>
      )}
      {!editing && (
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={onDelete}
          aria-label={`Delete achievement “${achievement.title}”`}
          className="opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100"
        >
          <X aria-hidden="true" />
        </Button>
      )}
    </li>
  )
}

export function AchievementsSection({
  achievements,
  onAdd,
  onEdit,
  onToggle,
  onDelete,
}: {
  achievements: Achievement[]
  onAdd: (title: string) => void
  onEdit: (id: string, title: string) => void
  onToggle: (id: string, achieved: boolean) => void
  onDelete: (id: string) => void
}) {
  const [newTitle, setNewTitle] = useState('')
  const achievedCount = achievements.filter((a) => a.state === 'achieved').length

  const addNow = () => {
    if (!newTitle.trim()) return
    onAdd(newTitle)
    setNewTitle('')
  }

  return (
    <section aria-labelledby="achievements-heading" className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <h2 id="achievements-heading" className="text-sm font-semibold">
          Achievements
        </h2>
        {achievements.length > 0 && (
          <span className="text-xs text-muted-foreground tabular-nums">
            {achievedCount}/{achievements.length} achieved
          </span>
        )}
      </div>

      {achievements.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nothing along the way yet — add the things you want to be able to do one day.
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {achievements.map((a) => (
            <AchievementRow
              key={a.id}
              achievement={a}
              onToggle={(achieved) => onToggle(a.id, achieved)}
              onEdit={(title) => onEdit(a.id, title)}
              onDelete={() => onDelete(a.id)}
            />
          ))}
        </ul>
      )}

      <div className="flex items-center gap-2 pt-1">
        <Input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addNow()
            }
          }}
          placeholder="Add an achievement…"
          aria-label="New achievement"
          className="h-7"
        />
        <Button variant="ghost" size="sm" onClick={addNow} disabled={!newTitle.trim()}>
          <Plus aria-hidden="true" /> Add
        </Button>
      </div>
    </section>
  )
}
