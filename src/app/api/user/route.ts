import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

// GET - Get current user profile
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        createdAt: true,
        _count: {
          select: {
            businesses: true,
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

// PATCH - Update user profile
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, avatar, currentPassword, newPassword } = body

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Prepare update data
    const updateData: { name?: string; avatar?: string; password?: string } = {}

    // Update name if provided
    if (name && name.trim()) {
      if (name.trim().length < 2) {
        return NextResponse.json(
          { error: "Nama harus minimal 2 karakter" },
          { status: 400 }
        )
      }
      updateData.name = name.trim()
    }

    // Update avatar if provided
    if (avatar !== undefined) {
      updateData.avatar = avatar
    }

    // Update password if provided
    if (newPassword) {
      // Validate current password
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Password saat ini harus diisi" },
          { status: 400 }
        )
      }

      if (!user.password) {
        return NextResponse.json(
          { error: "Akun ini tidak menggunakan password" },
          { status: 400 }
        )
      }

      const isValidPassword = await bcrypt.compare(currentPassword, user.password)
      if (!isValidPassword) {
        return NextResponse.json(
          { error: "Password saat ini salah" },
          { status: 400 }
        )
      }

      // Validate new password
      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: "Password baru minimal 6 karakter" },
          { status: 400 }
        )
      }

      updateData.password = await bcrypt.hash(newPassword, 10)
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
      }
    })

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: newPassword ? "Profil dan password berhasil diperbarui" : "Profil berhasil diperbarui"
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

// DELETE - Delete user account
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { password, confirmation } = body

    if (confirmation !== "DELETE") {
      return NextResponse.json(
        { error: "Konfirmasi tidak valid" },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Verify password if user has one
    if (user.password) {
      if (!password) {
        return NextResponse.json(
          { error: "Password harus diisi" },
          { status: 400 }
        )
      }

      const isValidPassword = await bcrypt.compare(password, user.password)
      if (!isValidPassword) {
        return NextResponse.json(
          { error: "Password salah" },
          { status: 400 }
        )
      }
    }

    // Delete user (cascade will delete businesses, campaigns, testimonials)
    await prisma.user.delete({
      where: { id: session.user.id }
    })

    return NextResponse.json({
      success: true,
      message: "Akun berhasil dihapus"
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
