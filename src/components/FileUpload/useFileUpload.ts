import { getAiResult } from "@/actions/getAiResult";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FileWithPreview } from "../../types/file";

interface UseFileUploadProps {
  maxFiles?: number;
  maxSize?: number; // in MB
  accept?: {
    [key: string]: string[];
  };
  disabled?: boolean;
  onChange?: (files: FileWithPreview[]) => void;
  onRemove?: (file: FileWithPreview) => void;
  initialFiles?: FileWithPreview[];
}

export const useFileUpload = ({
  maxFiles = 1,
  maxSize = 1,
  accept = {
    "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
    "application/pdf": [".pdf"],
  },
  disabled = false,
  onChange,
  onRemove,
  initialFiles = [],
}: UseFileUploadProps) => {
  const [files, setFiles] = useState<FileWithPreview[]>(initialFiles);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [prompt, setPrompt] = useState<string>("");
  const [aiResult, setAiResult] = useState<string>("");

  const createFilePreview = useCallback(
    (file: File): Promise<string | null> => {
      return new Promise((resolve) => {
        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = () => {
            resolve(reader.result as string);
          };
          reader.readAsDataURL(file);
        } else {
          resolve(null);
        }
      });
    },
    []
  );

  const simulateUpload = useCallback((fileWithPreview: FileWithPreview) => {
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
  }, []);

  const handleDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const newFiles: FileWithPreview[] = [];
      for (const file of acceptedFiles) {
        if (files.length + newFiles.length >= maxFiles) {
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
    [files, maxFiles, onChange, createFilePreview, simulateUpload]
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

  const handleSubmit = useCallback(async () => {
    if (files.length === 0) return;

    setIsLoading(true);
    try {
      const result = await getAiResult(prompt, files[0].file);
      setAiResult(result);
    } catch (error) {
      console.error("Error getting AI result:", error);
    } finally {
      setIsLoading(false);
    }
  }, [prompt, files]);

  const handleClose = useCallback(() => {
    setPrompt("");
    setAiResult("");
    setFiles([]);
  }, []);

  const handlePromptChange = useCallback((value: string) => {
    setPrompt(value);
  }, []);

  // Check if any file is still uploading
  const isUploading = files.some(
    (file) => file.progress !== undefined && file.progress < 100 && !file.error
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept,
    maxSize: maxSize * 1024 * 1024,
    multiple: maxFiles > 1,
    disabled: disabled || files.length >= maxFiles,
  });

  return {
    // State
    files,
    isLoading,
    prompt,
    aiResult,
    isDragActive,
    isUploading,

    // Handlers
    handleRemove,
    handleSubmit,
    handleClose,
    handlePromptChange,

    // Dropzone props
    getRootProps,
    getInputProps,

    // Computed values
    canUpload: !disabled && files.length < maxFiles,
    uploadedCount: files.filter((f) => !f.error).length,
    canSubmit: !isLoading && files.length > 0 && !isUploading,
  };
};
