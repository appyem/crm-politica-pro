// src/app/api/mensajes/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      plataforma, 
      mensaje, 
      asunto,
      tipo = 'masivo',
      votantesSeleccionados,
      variables = {}
    } = body

    if (!plataforma || !mensaje || !votantesSeleccionados || votantesSeleccionados.length === 0) {
      return NextResponse.json(
        { error: 'Plataforma, mensaje y votantes son requeridos' },
        { status: 400 }
      )
    }

    // Validar plataforma
    const plataformasValidas = ['whatsapp', 'email', 'sms', 'instagram']
    if (!plataformasValidas.includes(plataforma)) {
      return NextResponse.json(
        { error: 'Plataforma no válida' },
        { status: 400 }
      )
    }

    // Obtener votantes
    const votantes = await db.votante.findMany({
      where: {
        id: {
          in: votantesSeleccionados
        }
      }
    })

    if (votantes.length === 0) {
      return NextResponse.json(
        { error: 'No se encontraron votantes válidos' },
        { status: 404 }
      )
    }

    // Función para personalizar mensaje con variables
    const personalizarMensaje = (mensaje: string, votante: any, variables: any) => {
      let mensajePersonalizado = mensaje
      
      // Reemplazar variables comunes
      mensajePersonalizado = mensajePersonalizado.replace(/\{nombre\}/g, votante.nombre)
      mensajePersonalizado = mensajePersonalizado.replace(/\{email\}/g, votante.email || '')
      mensajePersonalizado = mensajePersonalizado.replace(/\{telefono\}/g, votante.telefono || '')
      mensajePersonalizado = mensajePersonalizado.replace(/\{whatsapp\}/g, votante.whatsapp || '')
      mensajePersonalizado = mensajePersonalizado.replace(/\{edad\}/g, votante.edad?.toString() || '')
      mensajePersonalizado = mensajePersonalizado.replace(/\{genero\}/g, votante.genero || '')
      mensajePersonalizado = mensajePersonalizado.replace(/\{colonia\}/g, votante.colonia || '')
      mensajePersonalizado = mensajePersonalizado.replace(/\{municipio\}/g, votante.municipio || '')
      mensajePersonalizado = mensajePersonalizado.replace(/\{seccion\}/g, votante.seccion || '')
      mensajePersonalizado = mensajePersonalizado.replace(/\{distrito\}/g, votante.distrito || '')
      mensajePersonalizado = mensajePersonalizado.replace(/\{ocupacion\}/g, votante.ocupacion || '')
      mensajePersonalizado = mensajePersonalizado.replace(/\{nivelEstudio\}/g, votante.nivelEstudio || '')
      
      // Reemplazar variables personalizadas
      Object.keys(variables).forEach(key => {
        const regex = new RegExp(`\\{${key}\\}`, 'g')
        mensajePersonalizado = mensajePersonalizado.replace(regex, variables[key])
      })
      
      return mensajePersonalizado
    }

    // Crear mensajes para cada votante
    const resultados = []
    for (const votante of votantes) {
      try {
        // Personalizar el mensaje
        const mensajePersonalizado = personalizarMensaje(mensaje, votante, variables)
        
        // Determinar el contacto según la plataforma
        let contacto = ''
        switch (plataforma) {
          case 'whatsapp':
            contacto = votante.whatsapp || votante.telefono || ''
            break
          case 'email':
            contacto = votante.email || ''
            break
          case 'sms':
            contacto = votante.telefono || ''
            break
          case 'instagram':
            contacto = votante.instagram || ''
            break
        }

        if (!contacto) {
          resultados.push({
            votanteId: votante.id,
            nombre: votante.nombre,
            success: false,
            error: `No hay contacto para ${plataforma}`
          })
          continue
        }

        // Crear registro del mensaje en la base de datos
        const mensajeDB = await db.mensaje.create({
          data: {
            votanteId: votante.id,
            plataforma,
            tipo,
            asunto: asunto || null,
            contenido: mensajePersonalizado,
            estado: 'enviado',
            fechaEnvio: new Date()
          }
        })

        // Aquí iría la integración real con las APIs
        // Por ahora, solo guardamos en la base de datos
        console.log(`Mensaje ${plataforma} guardado para ${votante.nombre}:`, {
          contacto,
          mensaje: mensajePersonalizado,
          asunto
        })

        resultados.push({
          votanteId: votante.id,
          nombre: votante.nombre,
          contacto,
          success: true,
          mensajeId: mensajeDB.id
        })

      } catch (error) {
        console.error(`Error procesando mensaje para ${votante.nombre}:`, error)
        resultados.push({
          votanteId: votante.id,
          nombre: votante.nombre,
          success: false,
          error: error instanceof Error ? error.message : 'Error desconocido'
        })
      }
    }

    const exitosos = resultados.filter(r => r.success).length
    const fallidos = resultados.filter(r => !r.success).length

    return NextResponse.json({
      message: `Campaña de mensajería completada. ${exitosos} mensajes guardados exitosamente, ${fallidos} con errores.`,
      resultados: {
        total: resultados.length,
        exitosos,
        fallidos,
        detalles: resultados
      }
    })

  } catch (error) {
    console.error('Error en mensajes masivos:', error)
    return NextResponse.json(
      { error: 'Error al procesar mensajes masivos' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const mensajes = await db.mensaje.findMany({
      include: {
        votante: {
          select: {
            nombre: true,
            email: true,
            telefono: true,
            whatsapp: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50
    })
    
    return NextResponse.json(mensajes)
  } catch (error) {
    console.error('Error obteniendo mensajes:', error)
    return NextResponse.json(
      { error: 'Error al obtener mensajes' },
      { status: 500 }
    )
  }
}