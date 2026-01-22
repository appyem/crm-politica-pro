import { NextRequest, NextResponse } from 'next/server'
import { scraperInstance, ValidacionCedula } from '@/lib/scraper'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cedula } = body

    // Validar formato de cédula colombiana
    if (!cedula || !/^\d{7,10}$/.test(cedula)) {
      return NextResponse.json({
        existe: false,
        error: 'Formato de cédula inválido. Debe contener entre 7 y 10 dígitos.'
      }, { status: 400 })
    }

    console.log(`📋 API: Recibida solicitud para validar cédula ${cedula}`)

    try {
      // Validar cédula usando el scraper
      const resultado = await scraperInstance.validarCedula(cedula)

      // Registrar el resultado para estadísticas
      console.log(`📊 Resultado validación:`, {
        cedula,
        existe: resultado.existe,
        tieneLugarVotacion: !!resultado.lugarVotacion,
        error: resultado.error
      })

      return NextResponse.json(resultado, { status: 200 })

    } catch (scrapingError) {
      console.error('❌ Error en scraping:', scrapingError)
      
      return NextResponse.json({
        existe: false,
        error: 'Error temporal al consultar la Registraduría. Por favor intente en unos minutos.'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ Error general en API:', error)
    
    return NextResponse.json({
      existe: false,
      error: 'Error interno del servidor. Por favor intente nuevamente.'
    }, { status: 500 })
  }
}

// Endpoint para verificar estado del servicio
export async function GET() {
  return NextResponse.json({
    servicio: 'validacion-cedula',
    estado: 'activo',
    descripcion: 'API para validación de cédulas colombianas',
    version: '1.0.0'
  })
}