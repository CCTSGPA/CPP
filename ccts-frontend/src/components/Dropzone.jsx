import React, { useCallback, useState } from "react";

export default function Dropzone({ onChange, disabled = false, files = null, onRemoveFile }) {
  const [internalFiles, setInternalFiles] = useState([]);
  const selectedFiles = Array.isArray(files) ? files : internalFiles;

  const handleFiles = useCallback(
    (selected) => {
      const arr = Array.from(selected).slice(0, 5);
      if (!Array.isArray(files)) {
        setInternalFiles(arr);
      }
      onChange?.(arr);
    },
    [files, onChange]
  );

  const removeFile = useCallback((index) => {
    const next = selectedFiles.filter((_, i) => i !== index);
    if (!Array.isArray(files)) {
      setInternalFiles(next);
    }
    if (onRemoveFile) {
      onRemoveFile(index, next);
      return;
    }
    onChange?.(next);
  }, [files, onChange, onRemoveFile, selectedFiles]);

  function onDrop(e) {
    e.preventDefault();
    if (disabled) return;
    handleFiles(e.dataTransfer.files);
  }

  function onSelect(e) {
    if (disabled) return;
    handleFiles(e.target.files);
  }

  return (
    <div>
      <div
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        className={`card border-dashed border-2 ${
          disabled
            ? "border-neutral-100 bg-neutral-50/60"
            : "border-neutral-200"
        } text-center py-10`}
      >
        <p className="font-medium">
          {disabled ? "Upload (view-only)" : "Drag & drop files here"}
        </p>
        <p className="text-sm text-neutral-500 mt-2">
          JPG, PNG, GIF, WEBP, PDF, TXT — max 10MB each
        </p>
        <input
          type="file"
          multiple
          onChange={onSelect}
          className="mt-4"
          disabled={disabled}
        />
        {disabled && (
          <div className="text-sm text-neutral-500 mt-3">
            Sign in to upload files.
          </div>
        )}
      </div>

      {selectedFiles.length > 0 && (
        <ul className="mt-3 space-y-2">
          {selectedFiles.map((f, i) => (
            <li
              key={i}
              className="flex items-center justify-between p-2 border rounded"
            >
              <div>
                <div className="text-sm font-medium">{f.name}</div>
                <div className="text-xs text-neutral-500">
                  {Math.round(f.size / 1024)} KB
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-xs text-neutral-500">{f.type || "—"}</div>
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="text-xs text-red-600 underline"
                  disabled={disabled}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
