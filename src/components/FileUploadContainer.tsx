"use client";

import { useState } from "react";
import { FileWithPreview } from "../types/file";
import FileUpload from "./FileUpload";

const FileUploadContainer = () => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const handleChange = (newFiles: FileWithPreview[]) => {
    setFiles(newFiles);
  };
  const handleRemove = (file: FileWithPreview) => {};

  return (
    <div className="w-full ">
      <FileUpload
        value={files}
        onChange={handleChange}
        onRemove={handleRemove}
        maxFiles={1}
        maxSize={20} // 20 MB
        accept={{
          "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
          "application/pdf": [".pdf"],
        }}
      />
    </div>
  );
};

export default FileUploadContainer;
