// src/app/api/votantes/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Tipado del cuerpo esperado (coincide con tu frontend)
interface CreateVotanteBody {
  cedula: string
  nombre: string
  email?: string
  telefono?: string
  whatsapp?: string
  instagram?: string
  edad?: string // viene como string desde el form
  genero?: string
  estado?: string
  departamento?: string
  municipio?: string
  barrio?: string
  sitioVotacion?: string
  lugarVotacion?: {
    ciudad?: string
    puesto?: string
    mesa?: string
    direccion?: string
    departamento?: string
  }
  ocupacion?: string
  nivelEstudio?: string
  intereses?: string
  notas?: string
}

export async function GET() {
  try {
    const votantes = await db.votante.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(votantes)
  } catch (error) {
    console.error('Error al obtener votantes:', error)
    return NextResponse.json({ error: 'Error al obtener votantes' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateVotanteBody

    // ✅ Ahora esto funcionará después de `prisma generate`
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
        edad: body.edad ? parseInt(body.edad, 10) : null,
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
    return NextResponse.json({ error: 'Error al crear votante' }, { status: 500 })
  }
}

// PUT y DELETE pueden quedar igual (ya están bien)
// ... (resto del archivo sin cambios)