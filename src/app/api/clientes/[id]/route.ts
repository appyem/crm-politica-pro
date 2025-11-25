import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cliente = await db.cliente.findUnique({
      where: { id: params.id },
      include: {
        ventas: true,
        citas: true,
        conversaciones: true
      }
    })

    if (!cliente) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(cliente)
  } catch (error) {
    console.error('Error fetching cliente:', error)
    return NextResponse.json(
      { error: 'Error al obtener cliente' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { nombre, email, telefono, empresa, direccion, notas, estado } = body

    // Validaciones básicas
    if (!nombre || !email) {
      return NextResponse.json(
        { error: 'Nombre y email son requeridos' },
        { status: 400 }
      )
    }

    // Verificar si el email ya existe (excluyendo el cliente actual)
    const clienteExistente = await db.cliente.findFirst({
      where: { 
        email,
        id: { not: params.id }
      }
    })

    if (clienteExistente) {
      return NextResponse.json(
        { error: 'Ya existe otro cliente con ese email' },
        { status: 400 }
      )
    }

    const clienteActualizado = await db.cliente.update({
      where: { id: params.id },
      data: {
        nombre,
        email,
        telefono: telefono || null,
        empresa: empresa || null,
        direccion: direccion || null,
        notas: notas || null,
        estado: estado || 'potencial'
      }
    })

    return NextResponse.json(clienteActualizado)
  } catch (error) {
    console.error('Error updating cliente:', error)
    return NextResponse.json(
      { error: 'Error al actualizar cliente' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.cliente.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Cliente eliminado correctamente' })
  } catch (error) {
    console.error('Error deleting cliente:', error)
    return NextResponse.json(
      { error: 'Error al eliminar cliente' },
      { status: 500 }
    )
  }
}