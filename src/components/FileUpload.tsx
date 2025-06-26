"use client";

import { getAiResult } from "@/actions/getAiResult";
import { cn } from "@/lib/utils";
import { FileIcon, Loader2Icon, Upload, X } from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FileWithPreview } from "../types/file";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Textarea } from "./ui/textarea";

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
    maxSize = 20, // in MB
    accept = {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
      "application/pdf": [".pdf"],
    },
    disabled = false,
  } = props;

  const [files, setFiles] = useState<FileWithPreview[]>(value);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [prompt, setPrompt] = useState<string>("");
  const [aiResult, setAiResult] = useState<string>("");

  const createFilePreview = (file: File): Promise<string | null> => {
    return new Promise((resolve) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        resolve(null); // No preview for non-image files
      }
    });
  };

  const simulateUpload = (fileWithPreview: FileWithPreview) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setFiles((prevFiles) =>
        prevFiles.map((f) =>
          f.file === fileWithPreview.file
            ? { ...f, progress: Math.min(progress, 100) }
            : f
        )
      );

      if (progress >= 100) {
        clearInterval(interval);
        setFiles((prevFiles) =>
          prevFiles.map((f) =>
            f.file === fileWithPreview.file ? { ...f, success: true } : f
          )
        );
      }
    }, 100);
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const newFiles: FileWithPreview[] = [];
      for (const file of acceptedFiles) {
        if (files.length + newFiles.length > maxFiles) {
          break;
        }

        const preview = await createFilePreview(file);

        const fileWithPreview: FileWithPreview = {
          file,
          preview,
          progress: 0,
        };

        newFiles.push(fileWithPreview);
        simulateUpload(fileWithPreview);
      }
      const updatedFiles = [...files, ...newFiles];
      setFiles(updatedFiles);
      onChange?.(updatedFiles);
    },
    [files, maxFiles, onChange]
  );

  const handleRemove = useCallback(
    (fileToRemove: FileWithPreview) => {
      const updatedFiles = files.filter((f) => f.file !== fileToRemove.file);
      setFiles(updatedFiles);
      onChange?.(updatedFiles);
      onRemove?.(fileToRemove);
    },
    [files, onChange, onRemove]
  );

  const onSubmit = async () => {
    setIsLoading(true);
    const result = await getAiResult(prompt, files[0].file);
    setAiResult(result);
    setIsLoading(false);
  };

  const handleClose = () => {
    setPrompt("");
    setAiResult("");
    setFiles([]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize: maxSize * 1024 * 1024,
    multiple: true,
    disabled: disabled || files.length >= maxFiles,
  });

  return (
    <div className="flex flex-col gap-4 w-full px-4 sm:px-0">
      {/* AI Result Section - Mobile Optimized */}
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

      {/* Textarea - Mobile Optimized */}
      <Textarea
        rows={6}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your prompt here..."
        className="min-h-[120px] sm:min-h-[150px] text-sm sm:text-base resize-none"
      />

      {/* File Upload Card - Mobile Optimized */}
      <Card className="w-full">
        <CardHeader className="pb-4 sm:pb-6">
          <CardTitle className="text-lg sm:text-xl">File Upload</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Drag and drop files here or click to select files.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 px-4 sm:px-6">
          {/* Drop Zone - Mobile Optimized */}
          <div
            {...getRootProps()}
            className={cn(
              "relative flex flex-col items-center justify-center w-full p-4 sm:p-6 border-2 border-dashed rounded-lg transition-colors",
              "min-h-[120px] sm:min-h-[140px]", // Responsive height
              isDragActive && files.length < maxFiles
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25",
              disabled || files.length >= maxFiles
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer hover:bg-muted/50 active:bg-muted/70"
            )}
          >
            <input
              {...getInputProps()}
              disabled={disabled || files.length >= maxFiles}
            />
            <div className="flex flex-col items-center justify-center text-center gap-2 sm:gap-3">
              <Upload
                className={cn(
                  "size-5 sm:size-6",
                  files.length >= maxFiles
                    ? "text-muted-foreground/50"
                    : "text-muted-foreground"
                )}
              />
              <div className="space-y-1">
                <p
                  className={cn(
                    "text-xs sm:text-sm font-medium px-2",
                    files.length >= maxFiles ? "text-muted-foreground/50" : ""
                  )}
                >
                  {files.length >= maxFiles
                    ? "Maximum files reached"
                    : "Drag and drop files here, or tap to select files."}
                </p>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Maximum {maxFiles} file(s), up to {maxSize}MB each
                </p>
              </div>
            </div>
          </div>

          {/* File List - Mobile Optimized */}
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
                    disabled={disabled}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>

        {/* Footer - Mobile Optimized */}
        <CardFooter className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 pt-4 px-4 sm:px-6">
          <p className="text-xs sm:text-sm text-muted-foreground order-2 sm:order-1 text-center sm:text-left">
            {`${
              files.filter((f) => !f.error).length
            }/${maxFiles} files uploaded`}
          </p>

          <Button
            disabled={isLoading || files.length === 0}
            onClick={onSubmit}
            className="w-full sm:w-auto order-1 sm:order-2 min-w-[100px] cursor-pointer"
            size="sm"
          >
            {isLoading ? (
              <>
                <Loader2Icon className="size-4 animate-spin mr-2" />
                Processing...
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
