'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Upload } from 'lucide-react'

type CheckpointType = 'MANUAL' | 'GIT_COMMIT' | 'DEPLOYMENT' | 'SCREENSHOT' | 'COLLABORATION'

interface CreateCheckpointFormProps {
  projectId: string
  onSubmit?: (data: CheckpointFormData) => void
  onCancel?: () => void
}

export interface CheckpointFormData {
  hash: string
  description: string
  checkpointType: CheckpointType
  collaborators: string[]
  file?: File
}

export function CreateCheckpointForm({ projectId, onSubmit, onCancel }: CreateCheckpointFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<CheckpointFormData>({
    hash: '',
    description: '',
    checkpointType: 'MANUAL',
    collaborators: [],
  })
  const [file, setFile] = useState<File | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await onSubmit?.({
        ...formData,
        file: file || undefined,
      })
    } catch (error) {
      console.error('Failed to create checkpoint:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const checkpointTypes: { value: CheckpointType; label: string }[] = [
    { value: 'MANUAL', label: 'Manual Checkpoint' },
    { value: 'GIT_COMMIT', label: 'Git Commit' },
    { value: 'DEPLOYMENT', label: 'Deployment' },
    { value: 'SCREENSHOT', label: 'Screenshot' },
    { value: 'COLLABORATION', label: 'Collaboration' },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Checkpoint</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="checkpointType">Checkpoint Type</Label>
            <Select
              value={formData.checkpointType}
              onValueChange={(value) =>
                value && setFormData((prev) => ({ ...prev, checkpointType: value as CheckpointType }))
              }
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {checkpointTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hash">Hash / Identifier</Label>
            <Input
              id="hash"
              name="hash"
              placeholder="e.g., abc123def456 or commit hash"
              value={formData.hash}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe this checkpoint..."
              value={formData.description}
              onChange={handleChange}
              rows={4}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Attachment (optional)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="file"
                type="file"
                onChange={handleFileChange}
                disabled={isLoading}
                className="flex-1"
              />
              <Upload className="h-4 w-4 text-muted-foreground" />
            </div>
            {file && (
              <p className="text-sm text-muted-foreground">
                Selected: {file.name}
              </p>
            )}
          </div>

          <div className="flex gap-2 justify-end">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Checkpoint
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
