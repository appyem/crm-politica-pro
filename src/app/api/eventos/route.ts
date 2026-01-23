// src/app/api/eventos/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const eventos = await db.evento.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(eventos)
  } catch (error) {
    console.error('Error al obtener eventos:', error)
    return NextResponse.json({ error: 'Error al obtener eventos' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.titulo || !body.fecha || !body.hora || !body.ubicacion) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
    }

    // Convertir asistentes a JSON string
    const asistentesString = body.asistentes ? JSON.stringify(body.asistentes) : null

    const evento = await db.evento.create({
      data: {
        titulo: body.titulo,
        descripcion: body.descripcion || '',
        fecha: new Date(body.fecha),
        hora: body.hora,
        ubicacion: body.ubicacion,
        tipo: body.tipo || 'reunion',
        estado: body.estado || 'programado',
        asistentes: asistentesString
      }
    })

    // Convertir de vuelta a objeto para la respuesta
    const eventoResponse = {
      ...evento,
      asistentes: evento.asistentes ? JSON.parse(evento.asistentes) : []
    }

    return NextResponse.json(eventoResponse, { status: 201 })
  } catch (error) {
    console.error('Error al crear evento:', error)
    return NextResponse.json({ error: 'Error al crear evento' }, { status: 500 })
  }
}