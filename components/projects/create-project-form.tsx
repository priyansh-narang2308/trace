"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, FolderPlus, Globe, Lock } from "lucide-react";

interface CreateProjectFormProps {
  onSubmit?: (data: ProjectFormData) => void;
  onCancel?: () => void;
}

export interface ProjectFormData {
  projectId: string;
  name: string;
  description: string;
  isPublic: boolean;
}

export function CreateProjectForm({
  onSubmit,
  onCancel,
}: CreateProjectFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ProjectFormData>({
    projectId: "",
    name: "",
    description: "",
    isPublic: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const projectId = formData.projectId || `trace-${Date.now()}`;
      await onSubmit?.({
        ...formData,
        projectId,
      });
    } catch (error) {
      console.error("Failed to create project:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <Card className="bg-[#07080a] border border-[#363739] shadow-key">
      <CardHeader className="pb-4 border-b border-[#363739]">
        <CardTitle className="flex items-center gap-2 text-[18px] font-medium text-[#ffffff] font-sans">
          <FolderPlus className="h-5 w-5 text-[#ff6363]" />
          <span>Create New TRACE Project</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="text-[13px] font-medium text-[#ffffff]"
            >
              Project Name
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g. Monad DeFi Aggregator"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="bg-[#111214] border-[#363739] text-[#ffffff] font-sans text-[14px] focus:border-[#ff6363]"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="projectId"
              className="text-[13px] font-medium text-[#ffffff]"
            >
              Onchain Project Identifier (Optional)
            </Label>
            <Input
              id="projectId"
              name="projectId"
              placeholder="monad-defi-aggregator"
              value={formData.projectId}
              onChange={handleChange}
              disabled={isLoading}
              className="bg-[#111214] border-[#363739] text-[#e6e6e6] font-mono text-[13px] focus:border-[#ff6363]"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="description"
              className="text-[13px] font-medium text-[#ffffff]"
            >
              Description & Hackathon Objectives
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe what your project builds on Monad..."
              value={formData.description}
              onChange={handleChange}
              rows={4}
              required
              disabled={isLoading}
              className="bg-[#111214] border-[#363739] text-[#ffffff] font-sans text-[14px] focus:border-[#ff6363]"
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-[#363739] p-3.5 bg-[#111214]/60">
            <div className="flex items-center gap-2.5">
              {formData.isPublic ? (
                <Globe className="h-5 w-5 text-[#59d499]" />
              ) : (
                <Lock className="h-5 w-5 text-[#ff6363]" />
              )}
              <div className="space-y-0.5">
                <Label
                  htmlFor="isPublic"
                  className="text-[13px] font-medium text-[#ffffff] cursor-pointer"
                >
                  {formData.isPublic ? "Public Repository" : "Private Project"}
                </Label>
              </div>
            </div>
            <Switch
              id="isPublic"
              checked={formData.isPublic}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, isPublic: checked }))
              }
              disabled={isLoading}
              className="cursor-pointer"
            />
          </div>

          <div className="flex gap-3 justify-end pt-3">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
                className="cursor-pointer bg-[#111214] hover:bg-[#1b1c1e] text-[#e6e6e6] border-[#363739] text-[13px] h-9 px-4"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isLoading}
              className="cursor-pointer bg-[#e6e6e6] hover:bg-[#ffffff] text-[#111214] font-medium text-[13px] h-9 px-5 rounded-lg shadow-sm"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <span>Deploy Project Entry</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
