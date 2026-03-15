import React, { useEffect, useMemo, useState } from 'react'
import { FileText, Plus, Trash2, PencilLine, Save, XCircle } from 'lucide-react'
import {
  createAdminForm,
  deleteAdminForm,
  fetchAdminForms,
  updateAdminForm
} from '../services/adminApi'

const initialForm = {
  title: '',
  description: '',
  department: '',
  fileUrl: '',
  fileName: '',
  active: true
}

const FormsManagement = () => {
  const [forms, setForms] = useState([])
  const [loading, setLoading] = useState(true)
  const [draft, setDraft] = useState(initialForm)
  const [editingId, setEditingId] = useState(null)

  const loadForms = async () => {
    setLoading(true)
    try {
      const data = await fetchAdminForms()
      setForms(data || [])
    } catch {
      setForms([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadForms()
  }, [])

  const departments = useMemo(() => [...new Set(forms.map((f) => f.department).filter(Boolean))], [forms])

  const startCreate = () => {
    setEditingId(null)
    setDraft(initialForm)
  }

  const startEdit = (form) => {
    setEditingId(form.id)
    setDraft({
      title: form.title || '',
      description: form.description || '',
      department: form.department || '',
      fileUrl: form.fileUrl || '',
      fileName: form.fileName || '',
      active: form.active !== false
    })
  }

  const saveDraft = async () => {
    if (!draft.title || !draft.department || !draft.fileUrl || !draft.fileName) {
      return
    }

    if (editingId) {
      await updateAdminForm(editingId, draft)
    } else {
      await createAdminForm(draft)
    }

    setDraft(initialForm)
    setEditingId(null)
    await loadForms()
  }

  const removeForm = async (id) => {
    await deleteAdminForm(id)
    await loadForms()
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Download Forms (Admin Controlled)</h2>
          <button
            onClick={startCreate}
            className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg text-sm"
          >
            <Plus className="w-4 h-4" /> New Form
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-3 mt-4">
          <input
            value={draft.title}
            onChange={(e) => setDraft((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="Form title"
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
          />
          <input
            value={draft.department}
            onChange={(e) => setDraft((prev) => ({ ...prev, department: e.target.value }))}
            placeholder="Department"
            list="department-list"
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
          />
          <input
            value={draft.fileName}
            onChange={(e) => setDraft((prev) => ({ ...prev, fileName: e.target.value }))}
            placeholder="File name"
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
          />
          <input
            value={draft.fileUrl}
            onChange={(e) => setDraft((prev) => ({ ...prev, fileUrl: e.target.value }))}
            placeholder="File URL"
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm md:col-span-2"
          />
          <input
            value={draft.description}
            onChange={(e) => setDraft((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Description"
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
          />
        </div>

        <datalist id="department-list">
          {departments.map((dep) => (
            <option key={dep} value={dep} />
          ))}
        </datalist>

        <div className="mt-3 flex gap-2">
          <button
            onClick={saveDraft}
            className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg text-sm"
          >
            <Save className="w-4 h-4" /> {editingId ? 'Save Changes' : 'Create Form'}
          </button>
          {editingId && (
            <button
              onClick={startCreate}
              className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm"
            >
              <XCircle className="w-4 h-4" /> Cancel
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Form</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Department</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Uploaded</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && (
                <tr><td colSpan={5} className="px-4 py-6 text-sm text-gray-500">Loading forms...</td></tr>
              )}
              {!loading && forms.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-6 text-sm text-gray-500">No forms uploaded yet.</td></tr>
              )}
              {forms.map((form) => (
                <tr key={form.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-purple-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">{form.title}</p>
                        <p className="text-xs text-gray-500">{form.description || 'No description'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{form.department}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{form.createdAt ? new Date(form.createdAt).toLocaleDateString() : '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${form.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                      {form.active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => startEdit(form)} className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded" title="Edit">
                        <PencilLine className="w-4 h-4" />
                      </button>
                      <button onClick={() => removeForm(form.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default FormsManagement