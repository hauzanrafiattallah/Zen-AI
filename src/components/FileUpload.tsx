"use client";

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
    className,
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
    }, 100); // Menambahkan interval delay (100ms)
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const newFiles: FileWithPreview[] = [];
      for (const file of acceptedFiles) {
        if (files.length + newFiles.length > maxFiles) {
          break; // Stop if max files limit is reached
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
  }

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
    fileRejections,
  } = useDropzone({
    onDrop,
    accept,
    maxSize: maxSize * 1024 * 1024, // Convert MB to bytes
    multiple: true,
    disabled: disabled || files.length >= maxFiles,
  });

  return (
    <div className="flex flex-col gap-4">
      <Textarea rows={10} onChange={() => {}} />
      <Card>
        <CardHeader>
          <CardTitle>File Upload</CardTitle>
          <CardDescription>
            Drag and drop files here or click to select files.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            {...getRootProps()}
            className={cn(
              "relative flex flex-col items-center justify-center w-full h-32 p-4 border-2 border-dashed rounded-lg transition-colors cursor-pointer",
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 ",
              disabled && "opacity-50 cursor-not-allowed",
              "hover:bg-muted/50"
            )}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center text-center gap-2">
              <Upload className="size-6" />
              <p className="text-sm font-medium">
                Drag and drop files here, or click to select files.
              </p>
            </div>
          </div>

          {files.length > 0 && (
            <div className="space-y-2">
              {files.map((file, index) => (
                <div
                  key={`${file.file.name}-${index}`}
                  className="flex items-center p-2 border rounded-lg"
                >
                  <div className="flex items-center flex-1 min-w-0 gap-2">
                    {file.preview ? (
                      <div className="relative size-10 overflow-hidden rounded">
                        <img
                          src={file.preview}
                          alt={file.file.name}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    ) : (
                      <div>
                        <FileIcon className="size-6" />
                      </div>
                    )}
                  </div>

                  <Button
                    variant={"ghost"}
                    size={"icon"}
                    className="ml-2 size-8 cursor-pointer"
                    onClick={() => handleRemove(file)}
                    disabled={disabled}
                  >
                    <X />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>

        <CardFooter>
          <div className="flex w-full justify-between">
            <p className="text-xs text-muted-foreground">
              {`${
                files.filter((f) => !f.error).length
              }/${maxFiles} files uploaded`}
            </p>
            <div>
              <Button
                disabled={isLoading}
                onClick={onSubmit}
                className="cursor-pointer"
              >
                {isLoading ? (
                  <Loader2Icon className="size-4 animate-spin" />
                ) : (
                  "Submit"
                )}
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default FileUpload;
