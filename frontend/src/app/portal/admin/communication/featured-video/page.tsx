"use client";

import { useEffect, useState } from "react";
import { useGetHomepageQuery, useUpdateHomepageMutation } from "@/lib/api/homepageApi";
import { uploadFileRequest } from "@/utils/uploadFile";
import { resolveMediaUrl } from "@/constants";
import { useToast } from "@/components/Toast";
import { usePagePermissions } from "@/hooks/usePagePermissions";

const defaults = {
  featured_enabled: true,
  featured_heading: "English for specific purpose (ESP)",
  featured_label: "Featured Video",
  featured_title: "Master English for Specific Purposes",
  featured_video_url: "https://www.youtube.com/watch?v=erjMgola4fQ",
  featured_thumbnail: "",
};

export default function FeaturedVideoManagement() {
  const { data, isLoading } = useGetHomepageQuery();
  const [updateHomepage, { isLoading: saving }] = useUpdateHomepageMutation();
  const { canEdit } = usePagePermissions("communication", "news_events");
  const { showToast } = useToast();
  const [form, setForm] = useState(defaults);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (data) setForm({ ...defaults, ...data, featured_thumbnail: data.featured_thumbnail || "" });
  }, [data]);

  const reset = () => {
    if (data) setForm({ ...defaults, ...data, featured_thumbnail: data.featured_thumbnail || "" });
  };

  const uploadThumbnail = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!isEditing || !file) return;
    try {
      setUploading(true);
      const result = await uploadFileRequest(file, { requireS3: true });
      setForm((old) => ({ ...old, featured_thumbnail: result.url }));
      showToast("Video thumbnail uploaded", "success");
    } catch {
      showToast("Thumbnail upload failed", "error");
    } finally {
      setUploading(false);
    }
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!data || !isEditing) return;
    try {
      await updateHomepage({ ...data, ...form, cta_link: "/auth/registration" }).unwrap();
      setIsEditing(false);
      showToast("Featured video updated successfully", "success");
    } catch (error: any) {
      showToast(error?.data?.error || "Update failed", "error");
    }
  };

  if (isLoading) return <div className="p-6">Loading featured video...</div>;
  const fieldClass = "mt-1 w-full rounded-lg border px-3 py-2 text-gray-900 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-600";

  return (
    <div className="p-4 sm:p-6">
      <form onSubmit={save} className="mx-auto max-w-5xl space-y-6 rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-900">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Featured Video</h1>
            <p className="text-sm text-gray-500">Manage the featured video displayed on the public website.</p>
          </div>
          {canEdit && !isEditing && <button type="button" onClick={() => setIsEditing(true)} className="rounded-lg bg-[#010080] px-5 py-2 font-semibold text-white">Update</button>}
        </div>

        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" disabled={!isEditing} checked={form.featured_enabled} onChange={(e) => setForm({ ...form, featured_enabled: e.target.checked })} className="h-4 w-4" />
          Show this section on the website
        </label>

        <div className="grid gap-5 md:grid-cols-2">
          {[["Section heading", "featured_heading"], ["Small label", "featured_label"], ["Video title", "featured_title"], ["YouTube/video URL", "featured_video_url"]].map(([label, key]) => (
            <label key={key} className="text-sm font-semibold">
              {label}
              <input required disabled={!isEditing} value={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className={fieldClass} />
            </label>
          ))}
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold">Custom thumbnail</h2>
              <p className="text-xs text-gray-500">Optional. YouTube thumbnail is used automatically when empty.</p>
            </div>
            {isEditing && <label className="cursor-pointer rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">{uploading ? "Uploading..." : "Upload Thumbnail"}<input type="file" accept="image/*" onChange={uploadThumbnail} disabled={uploading} className="hidden" /></label>}
          </div>
          {form.featured_thumbnail && (
            <div className="relative aspect-video max-w-lg overflow-hidden rounded-xl bg-gray-100">
              <img src={resolveMediaUrl(form.featured_thumbnail) || form.featured_thumbnail} alt="Featured video thumbnail" className="h-full w-full object-cover" />
              {isEditing && <button type="button" onClick={() => setForm({ ...form, featured_thumbnail: "" })} className="absolute right-2 top-2 rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white">Remove</button>}
            </div>
          )}
        </div>

        {isEditing && (
          <div className="flex gap-3">
            <button type="button" onClick={() => { reset(); setIsEditing(false); }} className="flex-1 rounded-lg border border-gray-300 py-3 font-semibold text-gray-700">Cancel</button>
            <button disabled={saving || uploading} className="flex-1 rounded-lg bg-[#010080] py-3 font-semibold text-white disabled:opacity-50">{saving ? "Saving..." : "Save Changes"}</button>
          </div>
        )}
      </form>
    </div>
  );
}
