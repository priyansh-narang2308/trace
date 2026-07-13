'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

interface CreateProjectFormProps {
  onSubmit?: (data: ProjectFormData) => void
  onCancel?: () => void
}

export interface ProjectFormData {
  projectId: string
  name: string
  description: string
  isPublic: boolean
}

export function CreateProjectForm({ onSubmit, onCancel }: CreateProjectFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<ProjectFormData>({
    projectId: '',
    name: '',
    description: '',
    isPublic: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Generate a unique project ID if not provided
      const projectId = formData.projectId || `proj-${Date.now()}`

      await onSubmit?.({
        ...formData,
        projectId,
      })
    } catch (error) {
      console.error('Failed to create project:', error)
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Project</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="My Awesome Project"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="projectId">Project ID (optional)</Label>
            <Input
              id="projectId"
              name="projectId"
              placeholder="my-awesome-project"
              value={formData.projectId}
              onChange={handleChange}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to auto-generate a unique ID
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe your project..."
              value={formData.description}
              onChange={handleChange}
              rows={4}
              required
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isPublic"
              checked={formData.isPublic}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, isPublic: checked }))
              }
              disabled={isLoading}
            />
            <Label htmlFor="isPublic">Make project public</Label>
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
              Create Project
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
