'use client'

import { CheckpointFormData } from './create-checkpoint-form'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  GitBranch, 
  Rocket, 
  Camera, 
  Users, 
  FileText,
  ExternalLink,
  Clock,
  Hash
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Checkpoint {
  id: string
  projectId: string
  checkpointHash: string
  description: string
  checkpointType: 'MANUAL' | 'GIT_COMMIT' | 'DEPLOYMENT' | 'SCREENSHOT' | 'COLLABORATION'
  creatorAddress: string
  screenshotUrl: string | null
  collaborators: string[]
  timestamp: string
  createdAt: string
}

interface CheckpointTimelineProps {
  checkpoints: Checkpoint[]
  onCheckpointClick?: (checkpoint: Checkpoint) => void
}

const checkpointTypeConfig = {
  MANUAL: {
    icon: FileText,
    label: 'Manual',
    color: 'bg-blue-500',
  },
  GIT_COMMIT: {
    icon: GitBranch,
    label: 'Git Commit',
    color: 'bg-green-500',
  },
  DEPLOYMENT: {
    icon: Rocket,
    label: 'Deployment',
    color: 'bg-purple-500',
  },
  SCREENSHOT: {
    icon: Camera,
    label: 'Screenshot',
    color: 'bg-orange-500',
  },
  COLLABORATION: {
    icon: Users,
    label: 'Collaboration',
    color: 'bg-pink-500',
  },
}

export function CheckpointTimeline({ checkpoints, onCheckpointClick }: CheckpointTimelineProps) {
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  if (checkpoints.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <FileText className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No checkpoints yet</h3>
          <p className="text-muted-foreground text-center">
            Create your first checkpoint to start tracking your project's progress
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {checkpoints.map((checkpoint, index) => {
        const config = checkpointTypeConfig[checkpoint.checkpointType]
        const Icon = config.icon

        return (
          <div key={checkpoint.id} className="relative">
            {/* Timeline line */}
            {index !== checkpoints.length - 1 && (
              <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-border" />
            )}

            <Card 
              className="ml-12 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onCheckpointClick?.(checkpoint)}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`absolute -left-12 mt-1 p-2 rounded-full ${config.color} text-white`}>
                    <Icon className="h-4 w-4" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {config.label}
                          </Badge>
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(checkpoint.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <h4 className="font-semibold">{checkpoint.description}</h4>
                      </div>
                    </div>

                    {/* Hash */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Hash className="h-3 w-3" />
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {checkpoint.checkpointHash.slice(0, 16)}...
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigator.clipboard.writeText(checkpoint.checkpointHash)
                        }}
                      >
                        Copy
                      </Button>
                    </div>

                    {/* Creator */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Created by</span>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {formatAddress(checkpoint.creatorAddress)}
                      </code>
                    </div>

                    {/* Attachment */}
                    {checkpoint.screenshotUrl && (
                      <div className="flex items-center gap-2">
                        <a
                          href={checkpoint.screenshotUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Attachment
                        </a>
                      </div>
                    )}

                    {/* Collaborators */}
                    {checkpoint.collaborators.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        {checkpoint.collaborators.slice(0, 3).map((addr) => (
                          <Badge key={addr} variant="outline" className="text-xs">
                            {formatAddress(addr)}
                          </Badge>
                        ))}
                        {checkpoint.collaborators.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{checkpoint.collaborators.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      })}
    </div>
  )
}
