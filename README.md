# Bridge Bionics

Sitio web estático de Bridge Bionics. La página de inicio está en `index.html`;
mantén ese archivo en la raíz del repositorio para que GitHub Pages la publique
como página principal.

## Páginas

- Inicio: `index.html`
- Dashboard financiero integrado (costos y punto de equilibrio):
  `Dashboard_Hoja_de_Costo/index%20(3).html`
- Las rutas anteriores `index_equilibrio.html` y `punto-de-equilibrio.html`
  redirigen a las secciones correspondientes del dashboard integrado.

La página principal ya enlaza al dashboard financiero integrado. Sus valores
base de costos y equilibrio corresponden a la planilla proporcionada; el
simulador permite cambiar el precio y las unidades sin modificar el archivo
original. Los recursos gráficos, modelos 3D, videos y fotos deben conservar sus
carpetas y nombres actuales: las páginas los referencian mediante rutas
relativas y GitHub Pages distingue mayúsculas y minúsculas.

## Publicar con GitHub Pages

El repositorio previsto es `bridge-bionic-1103`. Sube el contenido de este
proyecto a la raíz del repositorio, conservando `index.html` en esa ubicación.
El workflow `.github/workflows/pages.yml` publica el sitio automáticamente
cuando hay cambios en la rama `main`.

En **Settings → Pages**, selecciona **GitHub Actions** como origen de
publicación. Después del primer despliegue, el sitio estará disponible en
`https://<usuario>.github.io/bridge-bionic-1103/`; cada nuevo cambio en `main`
disparará otra publicación.

No se requiere un proceso de compilación ni instalar dependencias. La interfaz
carga algunas bibliotecas, fuentes y el visor 3D desde CDNs, por lo que las
funciones que las usan necesitan conexión a Internet.

## Servicios externos

El inicio de sesión depende de Firebase y el reconocimiento/estado depende de
la API de Cloudflare Workers. Para el dominio publicado, confirma en Firebase
que `<usuario>.github.io` esté autorizado y que el servicio de API permita las
solicitudes desde `https://<usuario>.github.io`. Publicar los archivos estáticos
no despliega ni cambia esos servicios. La configuración cliente de Firebase
está en el frontend; protege el proyecto con las restricciones de API y las
reglas de Firebase correspondientes.

## Archivos pendientes para una publicación completa

`index.html` ofrece dos pestañas para documentos que aún no están en el
proyecto. Mientras tanto, cada pestaña muestra un aviso en lugar de intentar
cargar un archivo inexistente. Cuando tengas los documentos originales,
agrégalos a la raíz y vuelve a enlazar las pestañas para mostrar su contenido.
No se sustituyeron por `aplicacion.pdf`, porque es un documento distinto:

- `generalidades del proyecto.pdf`
- `estudio de mercados.pdf`

Agrega los documentos correctos en la raíz del proyecto antes de publicar para
que puedan cargarse en esas ventanas. No se sustituyeron por `aplicacion.pdf`,
porque es un documento distinto.
