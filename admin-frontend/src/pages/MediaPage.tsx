import { useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

export default function MediaPage() {
  const qc = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);

  const { data } = useQuery({
    queryKey: ["files"],
    queryFn: async () => (await api.get("/admin/files")).data,
  });

  const upload = useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData();
      fd.append("file", file);
      return api.post("/admin/upload", fd);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["files"] }),
  });

  const remove = useMutation({
    mutationFn: async (id: number) => api.delete(`/admin/files/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["files"] }),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Media Library</h1>
        <div>
          <input ref={inputRef} type="file" hidden onChange={(e) => e.target.files?.[0] && upload.mutate(e.target.files[0])} />
          <button className="btn-primary" onClick={() => inputRef.current?.click()}>
            {upload.isPending ? "Upload…" : "+ Upload file"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {data?.items?.map((f: any) => (
          <div key={f.id} className="card p-2">
            {f.mimeType.startsWith("image/") ? (
              <img src={f.url} alt={f.originalName} className="w-full h-32 object-cover rounded" />
            ) : (
              <div className="w-full h-32 flex items-center justify-center bg-slate-100 rounded text-xs">
                {f.mimeType}
              </div>
            )}
            <div className="text-xs truncate mt-2" title={f.originalName}>{f.originalName}</div>
            <div className="flex justify-between mt-2">
              <button className="text-xs text-blue-600" onClick={() => navigator.clipboard.writeText(f.url)}>Copy URL</button>
              <button className="text-xs text-brand" onClick={() => confirm("Hapus?") && remove.mutate(f.id)}>Hapus</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
