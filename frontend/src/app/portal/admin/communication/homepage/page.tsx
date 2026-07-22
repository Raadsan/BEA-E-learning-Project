"use client";

import { useEffect, useState } from "react";
import { useGetHomepageQuery, useUpdateHomepageMutation } from "@/lib/api/homepageApi";
import { uploadFileRequest } from "@/utils/uploadFile";
import { resolveMediaUrl } from "@/constants";
import { useToast } from "@/components/Toast";
import { usePagePermissions } from "@/hooks/usePagePermissions";

const initial = { hero_title: "", hero_highlight: "", hero_description: "", hero_images: [] as string[], cta_text: "", cta_link: "/auth/registration" };

export default function HomepageManagement() {
  const { data, isLoading } = useGetHomepageQuery();
  const [updateHomepage, { isLoading: saving }] = useUpdateHomepageMutation();
  const { canEdit } = usePagePermissions("communication", "news_events");
  const { showToast } = useToast();
  const [form, setForm] = useState(initial);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);

  const resetFromServer = () => data && setForm({ ...initial, ...data, cta_link: "/auth/registration", hero_images: data.hero_images || [] });
  useEffect(() => { resetFromServer(); }, [data]);
  const words = form.hero_description.trim() ? form.hero_description.trim().split(/\s+/).length : 0;

  const upload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isEditing) return;
    const files = Array.from(event.target.files || []).slice(0, 6 - form.hero_images.length);
    if (!files.length) return;
    try {
      setUploading(true);
      const results = await Promise.all(files.map(uploadFileRequest));
      setForm((old) => ({ ...old, hero_images: [...old.hero_images, ...results.map((item) => item.url)].slice(0, 6) }));
      showToast("Hero images uploaded", "success");
    } catch { showToast("Image upload failed", "error"); }
    finally { setUploading(false); }
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isEditing) return;
    if (words > 300) return showToast("Description cannot exceed 300 words", "error");
    try {
      await updateHomepage({ ...form, cta_link: "/auth/registration" }).unwrap();
      setIsEditing(false);
      showToast("Homepage updated successfully", "success");
    } catch (error: any) { showToast(error?.data?.error || "Update failed", "error"); }
  };

  if (isLoading) return <div className="p-6">Loading homepage content...</div>;
  const fieldClass = `mt-1 w-full rounded-lg border px-3 py-2 text-gray-900 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-600`;

  return <div className="p-4 sm:p-6">
    <form onSubmit={save} className="mx-auto max-w-5xl space-y-6 rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-900">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><h1 className="text-2xl font-bold">Homepage Content</h1><p className="text-sm text-gray-500">Manage the homepage hero text, button and slider images.</p></div>
        {canEdit && !isEditing && <button type="button" onClick={() => setIsEditing(true)} className="rounded-lg bg-[#010080] px-5 py-2 font-semibold text-white">Update</button>}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {[["Hero title", "hero_title"], ["Highlighted title", "hero_highlight"], ["Button text", "cta_text"]].map(([label, key]) => <label key={key} className="text-sm font-semibold">{label}<input required disabled={!isEditing} value={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className={fieldClass} /></label>)}
      </div>

      <label className="block text-sm font-semibold">Hero description <span className={words > 300 ? "text-red-600" : "text-gray-400"}>({words}/300 words)</span><textarea required disabled={!isEditing} rows={7} value={form.hero_description} onChange={(e) => setForm({ ...form, hero_description: e.target.value })} className={`${fieldClass} ${words > 300 ? "border-red-500" : ""}`} /></label>

      <div>
        <div className="mb-3 flex items-center justify-between"><h2 className="font-semibold">Hero images ({form.hero_images.length}/6)</h2>{isEditing && <label className="cursor-pointer rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">{uploading ? "Uploading..." : "+ Upload Images"}<input type="file" multiple accept="image/*" onChange={upload} disabled={uploading || form.hero_images.length >= 6} className="hidden" /></label>}</div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{form.hero_images.map((image, index) => <div key={`${image}-${index}`} className="relative h-40 overflow-hidden rounded-xl bg-gray-100"><img src={image.startsWith('/images/') ? image : (resolveMediaUrl(image) || image)} alt={`Hero ${index + 1}`} className="h-full w-full object-cover" />{isEditing && <button type="button" onClick={() => setForm({ ...form, hero_images: form.hero_images.filter((_, i) => i !== index) })} className="absolute right-2 top-2 rounded-full bg-red-600 px-2 py-1 text-xs font-bold text-white">Remove</button>}</div>)}</div>
      </div>

      {isEditing && <div className="flex gap-3"><button type="button" onClick={() => { resetFromServer(); setIsEditing(false); }} className="flex-1 rounded-lg border border-gray-300 py-3 font-semibold text-gray-700">Cancel</button><button disabled={saving || uploading || words > 300 || !form.hero_images.length} className="flex-1 rounded-lg bg-[#010080] py-3 font-semibold text-white disabled:opacity-50">{saving ? "Saving..." : "Save Changes"}</button></div>}
    </form>
  </div>;
}
