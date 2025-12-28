"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import { 
  User, 
  Mail, 
  Calendar, 
  Building2, 
  Video, 
  MessageSquare,
  Lock,
  Trash2,
  Loader2,
  Eye,
  EyeOff,
  LogOut,
  Save,
  AlertTriangle
} from "lucide-react"

interface UserData {
  id: string
  name: string
  email: string
  avatar: string
  createdAt: string
}

interface Stats {
  businesses: number
  campaigns: number
  testimonials: number
}

interface SettingsFormProps {
  user: UserData
  stats: Stats
}

export function SettingsForm({ user, stats }: SettingsFormProps) {
  const router = useRouter()
  
  // Profile state
  const [name, setName] = useState(user.name)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Password state
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [isSavingPassword, setIsSavingPassword] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Delete account state
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletePassword, setDeletePassword] = useState("")
  const [deleteConfirmation, setDeleteConfirmation] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(new Date(dateStr))
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingProfile(true)
    setProfileMessage(null)

    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
      })

      const data = await res.json()

      if (res.ok) {
        setProfileMessage({ type: "success", text: "Profil berhasil diperbarui" })
        router.refresh()
      } else {
        setProfileMessage({ type: "error", text: data.error || "Gagal menyimpan profil" })
      }
    } catch {
      setProfileMessage({ type: "error", text: "Terjadi kesalahan" })
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordMessage(null)

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "Konfirmasi password tidak cocok" })
      return
    }

    if (newPassword.length < 6) {
      setPasswordMessage({ type: "error", text: "Password baru minimal 6 karakter" })
      return
    }

    setIsSavingPassword(true)

    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword })
      })

      const data = await res.json()

      if (res.ok) {
        setPasswordMessage({ type: "success", text: "Password berhasil diubah" })
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      } else {
        setPasswordMessage({ type: "error", text: data.error || "Gagal mengubah password" })
      }
    } catch {
      setPasswordMessage({ type: "error", text: "Terjadi kesalahan" })
    } finally {
      setIsSavingPassword(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "DELETE") {
      return
    }

    setIsDeleting(true)

    try {
      const res = await fetch("/api/user", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deletePassword, confirmation: deleteConfirmation })
      })

      const data = await res.json()

      if (res.ok) {
        await signOut({ callbackUrl: "/" })
      } else {
        alert(data.error || "Gagal menghapus akun")
      }
    } catch {
      alert("Terjadi kesalahan")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" })
  }

  return (
    <div className="space-y-6">
      {/* Account Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="text-lg font-semibold mb-4">Informasi Akun</h2>
        
        <div className="flex items-start gap-4 mb-6">
          <div className="w-16 h-16 bg-[#FDC435] rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-bold text-black">
              {user.name?.charAt(0)?.toUpperCase() || "U"}
            </span>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold">{user.name || "User"}</h3>
            <p className="text-gray-500 text-sm flex items-center gap-1.5">
              <Mail className="w-4 h-4" />
              {user.email}
            </p>
            <p className="text-gray-400 text-xs flex items-center gap-1.5 mt-1">
              <Calendar className="w-3.5 h-3.5" />
              Bergabung sejak {formatDate(user.createdAt)}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 text-gray-600 mb-1">
              <Building2 className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold">{stats.businesses}</p>
            <p className="text-xs text-gray-500">Bisnis</p>
          </div>
          <div className="text-center border-x border-gray-200">
            <div className="flex items-center justify-center gap-1.5 text-gray-600 mb-1">
              <Video className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold">{stats.campaigns}</p>
            <p className="text-xs text-gray-500">Campaigns</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 text-gray-600 mb-1">
              <MessageSquare className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold">{stats.testimonials}</p>
            <p className="text-xs text-gray-500">Rekaman</p>
          </div>
        </div>
      </div>

      {/* Edit Profile */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <User className="w-5 h-5" />
          Edit Profil
        </h2>
        
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FDC435] focus:border-transparent outline-none"
              placeholder="Nama Anda"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1">Email tidak dapat diubah</p>
          </div>

          {profileMessage && (
            <div className={`p-3 rounded-lg text-sm ${
              profileMessage.type === "success" 
                ? "bg-green-100 text-green-700" 
                : "bg-red-100 text-red-700"
            }`}>
              {profileMessage.text}
            </div>
          )}

          <button
            type="submit"
            disabled={isSavingProfile}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-black text-white rounded-xl font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {isSavingProfile ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Simpan Profil
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5" />
          Ubah Password
        </h2>
        
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password Saat Ini</label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FDC435] focus:border-transparent outline-none"
                placeholder="Masukkan password saat ini"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FDC435] focus:border-transparent outline-none"
                placeholder="Minimal 6 karakter"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password Baru</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FDC435] focus:border-transparent outline-none"
              placeholder="Ulangi password baru"
            />
          </div>

          {passwordMessage && (
            <div className={`p-3 rounded-lg text-sm ${
              passwordMessage.type === "success" 
                ? "bg-green-100 text-green-700" 
                : "bg-red-100 text-red-700"
            }`}>
              {passwordMessage.text}
            </div>
          )}

          <button
            type="submit"
            disabled={isSavingPassword || !currentPassword || !newPassword || !confirmPassword}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-black text-white rounded-xl font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {isSavingPassword ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Lock className="w-4 h-4" />
            )}
            Ubah Password
          </button>
        </form>
      </div>

      {/* Logout */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <LogOut className="w-5 h-5" />
          Keluar
        </h2>
        <p className="text-gray-600 text-sm mb-4">
          Keluar dari akun Anda di perangkat ini.
        </p>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-xl shadow-sm border border-red-200 p-5">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-red-600">
          <AlertTriangle className="w-5 h-5" />
          Zona Berbahaya
        </h2>
        <p className="text-gray-600 text-sm mb-4">
          Hapus akun Anda secara permanen. Semua data bisnis, campaign, dan rekaman akan dihapus dan tidak dapat dikembalikan.
        </p>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Hapus Akun
        </button>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-black">Hapus Akun?</h3>
                <p className="text-sm text-gray-500">Aksi ini tidak dapat dibatalkan</p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-700">
                Semua data berikut akan dihapus permanen:
              </p>
              <ul className="text-sm text-red-600 mt-2 space-y-1">
                <li>• {stats.businesses} Bisnis</li>
                <li>• {stats.campaigns} Campaign</li>
                <li>• {stats.testimonials} Rekaman video</li>
              </ul>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                  placeholder="Masukkan password Anda"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ketik <span className="font-bold text-red-600">DELETE</span> untuk konfirmasi
                </label>
                <input
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                  placeholder="DELETE"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeletePassword("")
                  setDeleteConfirmation("")
                }}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting || deleteConfirmation !== "DELETE" || !deletePassword}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Hapus Akun
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
