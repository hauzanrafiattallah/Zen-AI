"use client";

import { FileWithPreview } from "../../types/file";

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

  return (
    <div>
      <div>
        File Upload Component
      </div>
    </div>
  );
};

export default FileUpload;
