"use client";

import { useEffect, useState } from "react";
import DataTable from "@/components/DataTable";
import AdminTableActions from "@/components/admin/AdminTableActions";
import { useToast } from "@/components/Toast";
import { resolveMediaUrl } from "@/constants";
import { uploadFileRequest } from "@/utils/uploadFile";
import { useCreateBlogMutation, useDeleteBlogMutation, useGetBlogPageQuery, useUpdateBlogMutation, useUpdateBlogSettingsMutation } from "@/lib/api/blogApi";
import { usePagePermissions } from "@/hooks/usePagePermissions";

const emptyForm = () => ({ title: "", excerpt: "", content: "", category: "Learning Tips", author: "BEA Team", image_url: "", read_time: "5 min read", featured: false, status: "published", published_at: new Date().toISOString().slice(0, 16) });

export default function BlogManagementPage() {
  const { showToast } = useToast();
  const { canView, canAdd, canEdit, canDelete } = usePagePermissions("communication", "news_events");
  const { data, isLoading } = useGetBlogPageQuery(true);
  const [createBlog, { isLoading: creating }] = useCreateBlogMutation();
  const [updateBlog, { isLoading: updating }] = useUpdateBlogMutation();
  const [deleteBlog] = useDeleteBlogMutation();
  const [updateSettings] = useUpdateBlogSettingsMutation();
  const [editing, setEditing] = useState<any>(null);
  const [viewing, setViewing] = useState<any>(null);
  const [form, setForm] = useState(emptyForm());
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [settings, setSettings] = useState({ hero_title: "BEA Blog", hero_subtitle: "" });

  useEffect(() => { if (data?.settings) setSettings({ hero_title: data.settings.hero_title, hero_subtitle: data.settings.hero_subtitle }); }, [data]);

  const openAdd = () => { setEditing(null); setForm(emptyForm()); setShowForm(true); };
  const edit = (post: any) => {
    setEditing(post);
    setForm({ ...post, image_url: post.image_url || "", read_time: post.read_time || "", published_at: new Date(post.published_at).toISOString().slice(0, 16) });
    setShowForm(true);
  };
  const savePost = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const payload = { ...form, published_at: new Date(form.published_at).toISOString() };
      if (editing) await updateBlog({ id: editing.id, ...payload }).unwrap(); else await createBlog(payload).unwrap();
      showToast(editing ? "Blog updated successfully" : "Blog created successfully", "success");
      setShowForm(false); setEditing(null); setForm(emptyForm());
    } catch (error: any) { showToast(error?.data?.error || "Failed to save blog", "error"); }
  };
  const remove = async (post: any) => {
    if (!confirm(`Delete "${post.title}"?`)) return;
    try { await deleteBlog(post.id).unwrap(); showToast("Blog deleted", "success"); } catch { showToast("Failed to delete blog", "error"); }
  };
  const uploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; if (!file) return;
    try { setUploading(true); const result = await uploadFileRequest(file); setForm((old) => ({ ...old, image_url: result.url })); showToast("Image uploaded", "success"); }
    catch { showToast("Image upload failed", "error"); } finally { setUploading(false); }
  };
  const saveSettings = async () => {
    try { await updateSettings(settings).unwrap(); showToast("Blog page settings updated", "success"); } catch { showToast("Failed to update page settings", "error"); }
  };

  const columns = [
    { key: "image_url", label: "Image", width: "90px", render: (value: string, row: any) => value ? <img src={resolveMediaUrl(value) || value} className="h-12 w-16 rounded-lg object-cover" alt={row.title} /> : <div className="flex h-12 w-16 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">No image</div> },
    { key: "title", label: "Title" },
    { key: "category", label: "Category" },
    { key: "author", label: "Author" },
    { key: "published_at", label: "Published", render: (value: string) => new Date(value).toLocaleDateString() },
    { key: "status", label: "Status", render: (value: string) => <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${value === "published" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{value}</span> },
    { key: "featured", label: "Featured", render: (value: boolean) => value ? <span className="rounded-full bg-purple-100 px-2.5 py-1 text-xs font-semibold text-purple-700">Yes</span> : <span className="text-gray-400">No</span> },
    { key: "actions", label: "Actions", render: (_: unknown, row: any) => <AdminTableActions canView={canView} canEdit={canEdit} canDelete={canDelete} onView={() => setViewing(row)} onEdit={() => edit(row)} onDelete={() => remove(row)} /> },
  ];

  return <div className="space-y-6 p-4 sm:p-6">
    <div><h1 className="text-2xl font-bold">Blog Management</h1><p className="text-sm text-gray-500">Manage the public blog page and all articles.</p></div>
    <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900"><h2 className="mb-4 text-lg font-bold">Blog Page Header</h2><div className="grid gap-4 md:grid-cols-2"><label className="text-sm">Hero title<input value={settings.hero_title} onChange={(e) => setSettings({ ...settings, hero_title: e.target.value })} className="mt-1 w-full rounded-lg border px-3 py-2 text-gray-900" /></label><label className="text-sm">Hero subtitle<input value={settings.hero_subtitle} onChange={(e) => setSettings({ ...settings, hero_subtitle: e.target.value })} className="mt-1 w-full rounded-lg border px-3 py-2 text-gray-900" /></label></div>{canEdit && <button onClick={saveSettings} className="mt-4 rounded-lg bg-[#010080] px-4 py-2 text-white">Save Header</button>}</section>

    <DataTable title="Articles" columns={columns} data={data?.posts || []} isLoading={isLoading} showAddButton={canAdd} onAddClick={openAdd} emptyMessage="No blog articles found." rowsPerPage={10} />

    {viewing && <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 p-4" onClick={() => setViewing(null)}><article className="mx-auto my-8 max-w-3xl rounded-2xl bg-white p-6 text-gray-900 shadow-2xl sm:p-8" onClick={(event) => event.stopPropagation()}><div className="mb-5 flex items-start justify-between gap-4"><div><span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">{viewing.category}</span><h2 className="mt-3 text-2xl font-bold">{viewing.title}</h2></div><button onClick={() => setViewing(null)} className="text-3xl text-gray-400 hover:text-gray-700" aria-label="Close">×</button></div>{viewing.image_url && <img src={resolveMediaUrl(viewing.image_url) || viewing.image_url} alt={viewing.title} className="mb-5 max-h-80 w-full rounded-xl object-cover" />}<div className="mb-5 flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500"><span>By {viewing.author}</span><span>{new Date(viewing.published_at).toLocaleString()}</span><span>{viewing.read_time}</span><span className="capitalize">{viewing.status}</span>{viewing.featured && <span className="font-semibold text-purple-600">Featured</span>}</div><h3 className="font-semibold">Excerpt</h3><p className="mt-1 text-gray-600">{viewing.excerpt}</p><h3 className="mt-6 font-semibold">Full Content</h3><div className="mt-2 whitespace-pre-wrap leading-7 text-gray-700">{viewing.content}</div></article></div>}

    {showForm && <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 p-4"><form onSubmit={savePost} className="mx-auto my-6 max-w-3xl space-y-4 rounded-xl bg-white p-6 text-gray-900"><div className="flex justify-between"><h2 className="text-xl font-bold">{editing ? "Edit Blog" : "Add Blog"}</h2><button type="button" onClick={() => setShowForm(false)} className="text-2xl">×</button></div><div className="grid gap-4 md:grid-cols-2"><label>Title<input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1 w-full rounded border px-3 py-2" /></label><label>Category<input required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="mt-1 w-full rounded border px-3 py-2" /></label><label>Author<input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} className="mt-1 w-full rounded border px-3 py-2" /></label><label>Read time<input value={form.read_time} onChange={(e) => setForm({ ...form, read_time: e.target.value })} className="mt-1 w-full rounded border px-3 py-2" /></label><label>Publish date<input type="datetime-local" value={form.published_at} onChange={(e) => setForm({ ...form, published_at: e.target.value })} className="mt-1 w-full rounded border px-3 py-2" /></label><label>Status<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="mt-1 w-full rounded border px-3 py-2"><option value="published">Published</option><option value="draft">Draft</option></select></label></div><label className="block">Excerpt<textarea required value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} rows={3} className="mt-1 w-full rounded border px-3 py-2" /></label><label className="block">Full content<textarea required value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={10} className="mt-1 w-full rounded border px-3 py-2" /></label><div><label>Article image<input type="file" accept="image/*" onChange={uploadImage} className="mt-1 block w-full" /></label>{uploading && <p className="text-sm">Uploading...</p>}{form.image_url && <img src={resolveMediaUrl(form.image_url) || form.image_url} alt="Preview" className="mt-2 h-32 rounded object-cover" />}</div><label className="flex items-center gap-2"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Featured article</label><button disabled={creating || updating || uploading} className="w-full rounded-lg bg-[#010080] py-3 font-semibold text-white disabled:opacity-50">{creating || updating ? "Saving..." : "Save Blog"}</button></form></div>}
  </div>;
}
