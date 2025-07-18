/* eslint-disable @next/next/no-img-element */
"use client";

import { cn } from "@/lib/utils";
import { FileIcon, Loader2Icon, Upload, X } from "lucide-react";
import { FileWithPreview } from "../../types/file";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Textarea } from "../ui/textarea";
import { useFileUpload } from "./useFileUpload";

interface PropTypes {
  value?: FileWithPreview[];
  onChange?: (files: FileWithPreview[]) => void;
  onRemove?: (file: FileWithPreview) => void;
  maxFiles?: number;
  maxSize?: number; // in MB
  accept?: {
    [key: string]: string[];
  };
  disabled?: boolean;
  className?: string;
}

const FileUpload = (props: PropTypes) => {
  const {
    value = [],
    onChange,
    onRemove,
    maxFiles = 1,
    maxSize = 1,
    accept = {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
      "application/pdf": [".pdf"],
    },
    disabled = false,
  } = props;

  const {
    files,
    isLoading,
    prompt,
    aiResult,
    isDragActive,
    isUploading,
    handleRemove,
    handleSubmit,
    handleClose,
    handlePromptChange,
    getRootProps,
    getInputProps,
    canUpload,
    uploadedCount,
    canSubmit,
  } = useFileUpload({
    maxFiles,
    maxSize,
    accept,
    disabled,
    onChange,
    onRemove,
    initialFiles: value,
  });

  return (
    <div className="flex flex-col gap-4 w-full px-4 sm:px-0">
      {/* AI Result Section*/}
      {aiResult && (
        <div className="p-4 sm:p-6 bg-muted rounded-lg">
          <div className="prose prose-sm max-w-none break-words">
            <p className="text-sm sm:text-base leading-relaxed">{aiResult}</p>
          </div>
          <Button
            onClick={handleClose}
            className="mt-4 w-full sm:w-auto cursor-pointer"
            size="sm"
          >
            Close
          </Button>
        </div>
      )}

      {/* Textarea */}
      <Textarea
        rows={6}
        value={prompt}
        onChange={(e) => handlePromptChange(e.target.value)}
        placeholder="Enter your prompt here..."
        className="min-h-[120px] sm:min-h-[150px] text-sm sm:text-base resize-none"
      />

      {/* File Upload Card*/}
      <Card className="w-full">
        <CardHeader className="pb-4 sm:pb-6">
          <CardTitle className="text-lg sm:text-xl">File Upload</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Drag and drop files here or click to select files.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 px-4 sm:px-6">
          {/* Drop Zone */}
          <div
            {...getRootProps()}
            className={cn(
              "relative flex flex-col items-center justify-center w-full p-4 sm:p-6 border-2 border-dashed rounded-lg transition-colors",
              "min-h-[120px] sm:min-h-[140px]",
              isDragActive && canUpload
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25",
              !canUpload
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer hover:bg-muted/50 active:bg-muted/70"
            )}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center text-center gap-2 sm:gap-3">
              <Upload
                className={cn(
                  "size-5 sm:size-6",
                  !canUpload
                    ? "text-muted-foreground/50"
                    : "text-muted-foreground"
                )}
              />
              <div className="space-y-1">
                <p
                  className={cn(
                    "text-xs sm:text-sm font-medium px-2",
                    !canUpload ? "text-muted-foreground/50" : ""
                  )}
                >
                  {!canUpload
                    ? "Maximum files reached"
                    : "Drag and drop files here, or tap to select files."}
                </p>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Maximum {maxFiles} file(s), up to {maxSize}MB each
                </p>
              </div>
            </div>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-2 sm:space-y-3">
              {files.map((file, index) => (
                <div
                  key={`${file.file.name}-${index}`}
                  className="flex items-center p-3 sm:p-4 border rounded-lg bg-background/50"
                >
                  <div className="flex items-center flex-1 min-w-0 gap-2 sm:gap-3">
                    {/* File Preview/Icon */}
                    {file.preview ? (
                      <div className="relative size-10 sm:size-12 overflow-hidden rounded flex-shrink-0">
                        <img
                          src={file.preview}
                          alt={file.file.name}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    ) : (
                      <div className="flex-shrink-0">
                        <FileIcon className="size-8 sm:size-10 text-muted-foreground" />
                      </div>
                    )}

                    {/* File Info */}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm sm:text-base font-medium truncate">
                        {file.file.name}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {(file.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>

                      {/* Progress Bar */}
                      {file.progress !== undefined && file.progress < 100 && (
                        <div className="mt-2">
                          <div className="w-full bg-muted rounded-full h-1.5 sm:h-2">
                            <div
                              className="bg-primary h-1.5 sm:h-2 rounded-full transition-all duration-300"
                              style={{ width: `${file.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 size-8 sm:size-9 flex-shrink-0"
                    onClick={() => handleRemove(file)}
                    disabled={disabled || isUploading}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>

        {/* Footer */}
        <CardFooter className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 pt-4 px-4 sm:px-6">
          <p className="text-xs sm:text-sm text-muted-foreground order-2 sm:order-1 text-center sm:text-left">
            {`${uploadedCount}/${maxFiles} files uploaded`}
            {isUploading && (
              <span className="ml-2 text-primary">• Uploading...</span>
            )}
          </p>

          <Button
            disabled={!canSubmit}
            onClick={handleSubmit}
            className="w-full sm:w-auto order-1 sm:order-2 min-w-[100px] cursor-pointer"
            size="sm"
          >
            {isLoading ? (
              <>
                <Loader2Icon className="size-4 animate-spin" />
              </>
            ) : isUploading ? (
              <>
                <Loader2Icon className="size-4 animate-spin" />
              </>
            ) : (
              "Submit"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default FileUpload;
