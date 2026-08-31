"use client";

import { useCallback, useRef, useState } from "react";
import { deleteDocument, EmployeeDocument, uploadDocument, verifyDocument } from "@/lib/hr";

export function EmployeeDocumentManager({
  employeeId,
  documents,
  onDocumentAdded,
  onDocumentUpdated,
}: {
  employeeId: string;
  documents: EmployeeDocument[];
  onDocumentAdded: (doc: EmployeeDocument) => void;
  onDocumentUpdated: () => void;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [isVerifying, setIsVerifying] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    document_type: "PASSPORT",
    document_name: "",
    issue_date: "",
    expiry_date: "",
    notes: "",
  });

  const documentTypes = [
    "PASSPORT",
    "NATIONAL_ID",
    "DRIVER_LICENSE",
    "WORK_PERMIT",
    "HEALTH_CERTIFICATE",
    "TRAINING_CERTIFICATE",
    "EMPLOYMENT_CONTRACT",
    "OTHER",
  ];

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    setUploadError("");

    try {
      const form = new FormData();
      form.append("user_id", employeeId);
      form.append("uploaded_by", localStorage.getItem("user_id") || "");
      form.append("document_type", formData.document_type);
      form.append("document_name", formData.document_name || file.name);
      form.append("document_url", file.name); // Will be replaced by backend with actual URL
      form.append("file_size", String(file.size));

      if (formData.issue_date) form.append("issue_date", formData.issue_date);
      if (formData.expiry_date) form.append("expiry_date", formData.expiry_date);
      if (formData.notes) form.append("notes", formData.notes);

      // Append file
      form.append("file", file);

      const newDoc = await uploadDocument(form);
      onDocumentAdded(newDoc);

      // Reset form
      setFormData({
        document_type: "PASSPORT",
        document_name: "",
        issue_date: "",
        expiry_date: "",
        notes: "",
      });
      setShowUploadForm(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Failed to upload document");
    } finally {
      setIsUploading(false);
    }
  };

  const handleVerify = async (docId: string | number) => {
    setIsVerifying(String(docId));
    try {
      const userId = localStorage.getItem("user_id") || "";
      await verifyDocument(docId, userId, "Document verified by HR");
      onDocumentUpdated();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Failed to verify document");
    } finally {
      setIsVerifying(null);
    }
  };

  const handleDelete = async (docId: string | number) => {
    setIsDeleting(String(docId));
    try {
      await deleteDocument(docId);
      onDocumentUpdated();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Failed to delete document");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-4">
      {uploadError && (
        <div className="rounded-md border border-red-800 bg-red-900 p-3 text-sm text-red-200">
          {uploadError}
        </div>
      )}

      {!showUploadForm ? (
        <button
          onClick={() => setShowUploadForm(true)}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
          disabled={isUploading}
        >
          + Upload document
        </button>
      ) : (
        <div className="rounded-lg border border-zinc-700 bg-zinc-950 p-4">
          <h3 className="mb-3 font-bold text-white">Upload new document</h3>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-400">Document Type</label>
              <select
                value={formData.document_type}
                onChange={(e) => setFormData({ ...formData, document_type: e.target.value })}
                className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:border-blue-600"
              >
                {documentTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400">Document name</label>
              <input
                type="text"
                value={formData.document_name}
                onChange={(e) => setFormData({ ...formData, document_name: e.target.value })}
                placeholder="e.g., John Doe Passport"
                className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:border-blue-600"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-zinc-400">Issue date</label>
                <input
                  type="date"
                  value={formData.issue_date}
                  onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                  className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400">Expiry date</label>
                <input
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                  className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Optional notes about the document..."
                rows={2}
                className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400">Select file</label>
              <input
                ref={fileInputRef}
                type="file"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                disabled={isUploading}
                className="mt-1 w-full text-sm text-zinc-400"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowUploadForm(false)}
                disabled={isUploading}
                className="flex-1 rounded-md border border-zinc-700 px-3 py-2 text-sm font-semibold text-zinc-300 hover:bg-zinc-800 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || !formData.document_name}
                className="flex-1 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isUploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Documents list with actions */}
      <div className="space-y-2">
        {documents.length === 0 ? (
          <p className="text-sm text-zinc-500">No documents have been uploaded for this employee yet.</p>
        ) : (
          documents.map((doc) => (
            <div key={String(doc.id)} className="flex flex-col gap-2 rounded-lg border border-zinc-800 bg-zinc-950 p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">{doc.document_name}</p>
                <div className="mt-1 flex flex-wrap gap-2 text-xs text-zinc-500">
                  <span>{doc.document_type}</span>
                  {doc.expiry_date && <span>• Expires {new Date(doc.expiry_date).toLocaleDateString()}</span>}
                </div>
              </div>
              <div className="flex gap-2">
                {doc.is_verified ? (
                  <span className="rounded-full bg-emerald-900 px-2 py-1 text-xs font-bold text-emerald-400">Verified</span>
                ) : (
                  <>
                    <button
                      onClick={() => handleVerify(doc.id)}
                      disabled={isVerifying === String(doc.id)}
                      className="rounded-md bg-emerald-900 px-3 py-1 text-xs font-bold text-emerald-400 hover:bg-emerald-800 disabled:opacity-50"
                    >
                      {isVerifying === String(doc.id) ? "Verifying..." : "Verify"}
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleDelete(doc.id)}
                  disabled={isDeleting === String(doc.id)}
                  className="rounded-md bg-red-900 px-3 py-1 text-xs font-bold text-red-400 hover:bg-red-800 disabled:opacity-50"
                >
                  {isDeleting === String(doc.id) ? "Deleting..." : "Remove"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
