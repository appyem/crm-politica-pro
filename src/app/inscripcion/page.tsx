'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2, AlertCircle } from 'lucide-react'

interface EventoData {
  id: string
  titulo: string
  fecha: string
  hora: string
  ubicacion: string | null
}

interface LiderData {
  id: string
  nombre: string
}

export default function InscripcionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [evento, setEvento] = useState<EventoData | null>(null)
  const [lider, setLider] = useState<LiderData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Estados del formulario
  const [nombre, setNombre] = useState('')
  const [cedula, setCedula] = useState('')
  const [confirmarCedula, setConfirmarCedula] = useState('')
  const [telefono, setTelefono] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  // Cargar datos del evento y líder
  useEffect(() => {
    const cargarDatos = async () => {
      const eventoId = searchParams.get('evento')
      const liderId = searchParams.get('lider')

      if (!eventoId || !liderId) {
        setError('Enlace inválido')
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/inscripcion?evento=${eventoId}&lider=${liderId}`)
        const data = await response.json()

        if (!response.ok) {
          setError(data.error || 'Error al cargar los datos')
          return
        }

        setEvento(data.evento)
        setLider(data.lider)
      } catch (err) {
        setError('Error de conexión')
      } finally {
        setLoading(false)
      }
    }

    cargarDatos()
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validaciones
    if (cedula !== confirmarCedula) {
      alert('Las cédulas no coinciden')
      return
    }

    if (!cedula || !nombre || !telefono) {
      alert('Todos los campos son obligatorios')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const eventoId = searchParams.get('evento')
      const liderId = searchParams.get('lider')

      const response = await fetch('/api/inscripciones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventoId,
          liderId,
          nombre,
          cedula,
          telefono
        })
      })

      const result = await response.json()

      if (!response.ok) {
        if (response.status === 409) {
          setError('Esta cédula ya está registrada')
        } else {
          setError(result.error || 'Error al inscribirse')
        }
        return
      }

      setSuccess(true)
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando invitación...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-center">¡Inscripción exitosa!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600">
              Gracias por confirmar tu asistencia a la reunión.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle>Invitación a Reunión Política</CardTitle>
            <CardDescription>
              Confirmar asistencia a la reunión organizada por {lider?.nombre}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Información del evento */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-bold text-lg mb-2">{evento?.titulo}</h3>
              <p className="text-sm">
                📅 {new Date(evento?.fecha || '').toLocaleDateString('es-CO')}
                {' '}⏰ {evento?.hora}
                {evento?.ubicacion && ` • 📍 ${evento.ubicacion}`}
              </p>
            </div>

            {/* Formulario de inscripción */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nombre">Nombre completo *</Label>
                <Input
                  id="nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="cedula">Cédula *</Label>
                <Input
                  id="cedula"
                  type="text"
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="confirmarCedula">Confirmar cédula *</Label>
                <Input
                  id="confirmarCedula"
                  type="text"
                  value={confirmarCedula}
                  onChange={(e) => setConfirmarCedula(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="telefono">Teléfono / WhatsApp *</Label>
                <Input
                  id="telefono"
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  required
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={submitting}
              >
                {submitting ? 'Inscribiendo...' : 'Confirmar Asistencia'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}