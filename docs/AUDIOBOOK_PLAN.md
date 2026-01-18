# Plan de Generación de Audiobook con Fish Audio API

## Análisis de la Situación Actual

### Problema Identificado
- Fish Audio API **NO reconoce** marcadores como `<break>`, `(break)`, `(long-break)`, etc.
- La solución anterior requería post-procesamiento manual para insertar silencios
- Necesitamos una estrategia más eficiente y automatizada

### Recursos Disponibles
- Fish Audio API key configurada en `.env`
- Voice ID: `f53102becdf94a51af6d64010bc658f2`
- 11 capítulos en inglés y español
- Estructura JSON con secciones bien definidas

## Estrategia Propuesta: "Micro-Chunks con Silencio Natural"

### Enfoque Principal
En lugar de marcar pausas en el texto, generamos **múltiples archivos de audio pequeños** y los concatenamos con silencios programáticos.

### Proceso de 4 Etapas

#### Etapa 1: Preparación del Texto
```javascript
// Dividir cada capítulo en "chunks" lógicos
{
  "chunks": [
    {
      "type": "intro",        // Número y título del capítulo
      "text": "...",
      "pauseAfter": 2.0       // segundos de silencio después
    },
    {
      "type": "paragraph",
      "text": "...",
      "pauseAfter": 0.8
    },
    {
      "type": "quote",         // Citas bíblicas o enfáticas
      "text": "...",
      "pauseAfter": 1.5
    }
  ]
}
```

**Tipos de pausas:**
- Después de título: 2.0 segundos
- Entre párrafos: 0.8 segundos
- Después de citas: 1.5 segundos
- Entre secciones: 2.5 segundos
- Final de capítulo: 3.0 segundos

#### Etapa 2: Generación de Audio Individual
```bash
# Para cada chunk:
1. Limpiar texto (remover HTML, formatear)
2. Llamar a Fish Audio API
3. Guardar como: ch1-chunk-001.mp3, ch1-chunk-002.mp3, etc.
4. Delay entre llamadas para evitar rate limits (500ms)
```

#### Etapa 3: Generación de Silencios
```javascript
// Crear archivos de silencio usando ffmpeg
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 0.8 -q:a 9 -acodec libmp3lame silence-0.8s.mp3
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 1.5 -q:a 9 -acodec libmp3lame silence-1.5s.mp3
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 2.0 -q:a 9 -acodec libmp3lame silence-2.0s.mp3
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 2.5 -q:a 9 -acodec libmp3lame silence-2.5s.mp3
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 3.0 -q:a 9 -acodec libmp3lame silence-3.0s.mp3
```

#### Etapa 4: Concatenación Final
```bash
# Crear lista de concatenación
file 'ch1-chunk-001.mp3'
file 'silence-2.0s.mp3'
file 'ch1-chunk-002.mp3'
file 'silence-0.8s.mp3'
file 'ch1-chunk-003.mp3'
...

# Concatenar con ffmpeg
ffmpeg -f concat -safe 0 -i concat-list.txt -c copy ch1-final.mp3
```

## Ventajas de este Enfoque

1. **Control Total de Pausas**: Definimos exactamente cuántos segundos de silencio
2. **Sin Marcadores**: No dependemos de tags que Fish Audio no soporta
3. **Repetible**: Si falla un chunk, solo regeneramos ese fragmento
4. **Escalable**: Podemos procesar capítulos en paralelo
5. **Profesional**: Pausas consistentes y predecibles
6. **Cache-friendly**: Chunks generados se pueden reutilizar

## Estructura de Archivos

```
audio/
├── en/
│   ├── ch1/
│   │   ├── chunks/
│   │   │   ├── ch1-chunk-001.mp3
│   │   │   ├── ch1-chunk-002.mp3
│   │   │   └── ...
│   │   ├── ch1-concat-list.txt
│   │   └── ch1-final.mp3
│   └── ...
├── es/
│   └── ...
└── silences/
    ├── silence-0.8s.mp3
    ├── silence-1.5s.mp3
    ├── silence-2.0s.mp3
    ├── silence-2.5s.mp3
    └── silence-3.0s.mp3
```

## Implementación por Fases

### Fase 1: Script de Preparación (Listo para implementar)
- Leer capítulos JSON
- Dividir en chunks con metadata de pausas
- Limpiar texto (remover HTML, {term:...}, etc.)
- Generar JSON intermedio con chunks

### Fase 2: Script de Generación (Listo para implementar)
- Generar silencios una vez
- Loop por cada chunk
- Llamar a Fish Audio API
- Guardar archivos individuales
- Mostrar progreso

### Fase 3: Script de Concatenación (Listo para implementar)
- Crear archivo concat-list.txt
- Ejecutar ffmpeg
- Validar audio final
- Limpiar archivos temporales (opcional)

### Fase 4: Script Todo-en-Uno (Listo para implementar)
- Combinar las 3 fases
- Manejo de errores robusto
- Reintentos automáticos
- Logging detallado

## Consideraciones Técnicas

### Rate Limiting de Fish Audio
- Máximo: Consultar documentación de Fish Audio
- Estrategia: Delay de 500ms entre requests
- Fallback: Exponential backoff si hay errores 429

### Calidad de Audio
- Bitrate: 128kbps (equilibrio calidad/tamaño)
- Sample rate: 44100Hz (estándar MP3)
- Formato: MP3 estéreo

### Costos Estimados
- Fish Audio cobra por caracteres procesados
- Capítulo promedio: ~10,000 caracteres
- 11 capítulos × 2 idiomas = 22 audiobooks
- Total estimado: ~220,000 caracteres

## Prueba Piloto Recomendada

**Antes de procesar todos los capítulos:**

1. Seleccionar el capítulo más corto (probablemente ch11)
2. Procesarlo completamente en inglés
3. Validar:
   - Calidad de voz
   - Pausas apropiadas
   - Sincronización
   - Duración total
4. Ajustar parámetros si es necesario
5. Repetir con capítulo en español
6. Solo entonces procesar los 11 capítulos completos

## Próximos Pasos

1. ✅ Crear este plan documentado
2. ⏳ Implementar script de preparación de chunks
3. ⏳ Implementar script de generación de audio
4. ⏳ Crear silencios de referencia
5. ⏳ Implementar script de concatenación
6. ⏳ Prueba con capítulo corto
7. ⏳ Ajustes basados en prueba
8. ⏳ Procesamiento completo de 22 audiobooks

## Comandos Rápidos para Desarrollo

```bash
# Preparar chunks de un capítulo
node scripts/prepare-audio-chunks.js 1 en

# Generar audio de un capítulo
node scripts/generate-chapter-audio.js 1 en

# Concatenar audio final
node scripts/concat-chapter-audio.js 1 en

# Todo-en-uno (preparar + generar + concatenar)
node scripts/build-audiobook.js 1 en

# Procesar todos los capítulos
node scripts/build-audiobook.js all en
node scripts/build-audiobook.js all es
```

## Notas Finales

- **NO usar marcadores de pausa en el texto** - Fish Audio los ignora
- **Chunks pequeños** = mayor control y facilidad de debug
- **ffmpeg es necesario** - instalar si no está disponible
- **Backup de archivos intermedios** por si necesitamos regenerar
