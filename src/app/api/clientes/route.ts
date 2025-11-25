import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const clientes = await db.cliente.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return NextResponse.json(clientes)
  } catch (error) {
    console.error('Error fetching clientes:', error)
    return NextResponse.json(
      { error: 'Error al obtener clientes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nombre, email, telefono, empresa, direccion, notas } = body

    // Validaciones básicas
    if (!nombre || !email) {
      return NextResponse.json(
        { error: 'Nombre y email son requeridos' },
        { status: 400 }
      )
    }

    // Verificar si el email ya existe
    const clienteExistente = await db.cliente.findUnique({
      where: { email }
    })

    if (clienteExistente) {
      return NextResponse.json(
        { error: 'Ya existe un cliente con ese email' },
        { status: 400 }
      )
    }

    const nuevoCliente = await db.cliente.create({
      data: {
        nombre,
        email,
        telefono: telefono || null,
        empresa: empresa || null,
        direccion: direccion || null,
        notas: notas || null,
        estado: 'potencial'
      }
    })

    return NextResponse.json(nuevoCliente, { status: 201 })
  } catch (error) {
    console.error('Error creating cliente:', error)
    return NextResponse.json(
      { error: 'Error al crear cliente' },
      { status: 500 }
    )
  }
}