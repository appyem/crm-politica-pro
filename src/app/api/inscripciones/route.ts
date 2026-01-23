import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

interface CreateInscripcionBody {
  eventoId: string
  liderId: string
  nombre: string
  cedula: string
  telefono: string
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateInscripcionBody

    // Validaciones básicas
    if (!body.eventoId || !body.liderId || !body.nombre || !body.cedula || !body.telefono) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    // Verificar que el evento exista
    const evento = await db.evento.findUnique({
      where: { id: body.eventoId }
    })

    if (!evento) {
      return NextResponse.json(
        { error: 'Evento no encontrado' },
        { status: 404 }
      )
    }

    // Verificar que el líder exista y sea "potencial"
    const lider = await db.votante.findUnique({
      where: { id: body.liderId }
    })

    if (!lider || lider.estado !== 'potencial') {
      return NextResponse.json(
        { error: 'Líder no válido' },
        { status: 404 }
      )
    }

    // Verificar si la cédula ya está registrada en Votante
    const votanteExistente = await db.votante.findUnique({
      where: { cedula: body.cedula }
    })

    if (votanteExistente) {
      return NextResponse.json(
        { error: 'Usuario ya registrado' },
        { status: 409 }
      )
    }

    // Verificar si la cédula ya está inscrita para este evento
    const inscripcionExistente = await db.inscripcion.findFirst({
      where: { 
        cedula: body.cedula,
        eventoId: body.eventoId
      }
    })

    if (inscripcionExistente) {
      return NextResponse.json(
        { error: 'Ya estás inscrito en esta reunión' },
        { status: 409 }
      )
    }

    // Crear la inscripción
    const inscripcion = await db.inscripcion.create({
      data: {
        eventoId: body.eventoId,
        liderId: body.liderId,
        nombre: body.nombre,
        cedula: body.cedula,
        telefono: body.telefono
      }
    })

    return NextResponse.json(inscripcion, { status: 201 })
  } catch (error: any) {
    console.error('Error al crear inscripción:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Cédula ya registrada' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}