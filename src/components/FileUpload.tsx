"use client";

import { cn } from "@/lib/utils";
import { Upload } from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FileWithPreview } from "../../types/file";
import {
  Card,
  CardContent,
  CardDescription,
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
              "relative flex flex-col items-center justify-center w-full h-32 p-4 border-2 border-dashed rounded-lg transition-colors",
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
        </CardContent>
      </Card>
    </div>
  );
};

export default FileUpload;
