import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const votantes = await db.votante.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return NextResponse.json(votantes)
  } catch (error) {
    console.error('Error al obtener votantes:', error)
    return NextResponse.json(
      { error: 'Error al obtener votantes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar que la cédula sea única
    const existingVotante = await db.votante.findUnique({
      where: { cedula: body.cedula }
    })
    
    if (existingVotante) {
      return NextResponse.json(
        { error: 'Ya existe un votante con esta cédula' },
        { status: 400 }
      )
    }
    
    const votante = await db.votante.create({
      data: {
        cedula: body.cedula,
        nombre: body.nombre,
        email: body.email || null,
        telefono: body.telefono || null,
        whatsapp: body.whatsapp || null,
        instagram: body.instagram || null,
        edad: body.edad ? parseInt(body.edad) : null,
        genero: body.genero || null,
        estado: body.estado || 'potencial',
        departamento: body.departamento || null,
        municipio: body.municipio || null,
        barrio: body.barrio || null,
        sitioVotacion: body.sitioVotacion || null,
        lugarCiudad: body.lugarVotacion?.ciudad || null,
        lugarPuesto: body.lugarVotacion?.puesto || null,
        lugarMesa: body.lugarVotacion?.mesa || null,
        lugarDireccion: body.lugarVotacion?.direccion || null,
        lugarDepartamento: body.lugarVotacion?.departamento || null,
        ocupacion: body.ocupacion || null,
        nivelEstudio: body.nivelEstudio || null,
        intereses: body.intereses || null,
        notas: body.notas || null
      }
    })
    
    return NextResponse.json(votante, { status: 201 })
  } catch (error) {
    console.error('Error al crear votante:', error)
    return NextResponse.json(
      { error: 'Error al crear votante' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...data } = body
    
    const votante = await db.votante.update({
      where: { id },
      data: {
        ...data,
        edad: data.edad ? parseInt(data.edad) : undefined,
        updatedAt: new Date()
      }
    })
    
    return NextResponse.json(votante)
  } catch (error) {
    console.error('Error al actualizar votante:', error)
    return NextResponse.json(
      { error: 'Error al actualizar votante' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID del votante es requerido' },
        { status: 400 }
      )
    }
    
    await db.votante.delete({
      where: { id }
    })
    
    return NextResponse.json({ message: 'Votante eliminado correctamente' })
  } catch (error) {
    console.error('Error al eliminar votante:', error)
    return NextResponse.json(
      { error: 'Error al eliminar votante' },
      { status: 500 }
    )
  }
}