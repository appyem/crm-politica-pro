import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const votante = await db.votante.findUnique({
      where: { id: params.id },
      include: {
        mensajes: true,
        eventos: true
      }
    })

    if (!votante) {
      return NextResponse.json(
        { error: 'Votante no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(votante)
  } catch (error) {
    console.error('Error fetching votante:', error)
    return NextResponse.json(
      { error: 'Error al obtener votante' },
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
    const { 
      nombre, 
      email, 
      telefono, 
      whatsapp, 
      instagram,
      edad,
      genero,
      estado,
      colonia,
      municipio,
      seccion,
      distrito,
      ocupacion,
      nivelEstudio,
      intereses,
      notas
    } = body

    // Validaciones básicas
    if (!nombre) {
      return NextResponse.json(
        { error: 'El nombre es requerido' },
        { status: 400 }
      )
    }

    const votanteActualizado = await db.votante.update({
      where: { id: params.id },
      data: {
        nombre,
        email: email || null,
        telefono: telefono || null,
        whatsapp: whatsapp || null,
        instagram: instagram || null,
        edad: edad || null,
        genero: genero || null,
        estado: estado || 'potencial',
        colonia: colonia || null,
        municipio: municipio || null,
        seccion: seccion || null,
        distrito: distrito || null,
        ocupacion: ocupacion || null,
        nivelEstudio: nivelEstudio || null,
        intereses: intereses || null,
        notas: notas || null
      }
    })

    return NextResponse.json(votanteActualizado)
  } catch (error) {
    console.error('Error updating votante:', error)
    return NextResponse.json(
      { error: 'Error al actualizar votante' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.votante.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Votante eliminado correctamente' })
  } catch (error) {
    console.error('Error deleting votante:', error)
    return NextResponse.json(
      { error: 'Error al eliminar votante' },
      { status: 500 }
    )
  }
}