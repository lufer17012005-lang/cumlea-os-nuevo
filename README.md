# Dashboard: La paradoja del cumpleaños

Proyecto académico de Estadística I desarrollado con HTML, CSS y JavaScript puro.

## Cómo ejecutarlo
1. Descarga y descomprime `paradoja_cumpleanos_dashboard.zip`.
2. Abre la carpeta `paradoja_cumpleanos_dashboard` en Visual Studio Code.
3. Abre `index.html` en el navegador. También puedes usar la extensión **Live Server** de VS Code y pulsar **Go Live**.
4. No requiere instalar paquetes, configurar un servidor ni crear cuentas.

## Archivos
- `index.html`: estructura de la aplicación.
- `styles.css`: diseño premium y adaptación a móvil.
- `app.js`: cálculos, gráficas, filtros, tabla y exportación.
- `data.js`: los 100 cumpleaños simulados.
- `cumpleanos_100_participantes.csv`: datos en formato CSV para Excel u otras herramientas.

## Módulos nuevos
- `extras.js`: base editable (agregar, modificar, eliminar; se guarda en el navegador), importación CSV (reemplazar o agregar), espacio muestral y regla del complemento, árbol de probabilidad, teorema de Bayes (modelo y base de datos), calculadora binomial con dos ejercicios resueltos, simulador interactivo y sección de hallazgos, conclusiones y recomendación.

## Funcionalidades
- Indicadores calculados automáticamente.
- Distribución mensual.
- Fechas de cumpleaños repetidas.
- Comparación de personas en fechas compartidas y únicas.
- Curva teórica de probabilidad para grupos de 2 a 100 personas.
- Biblioteca de fórmulas: frecuencias absoluta, relativa, porcentual y acumulada; media, rango, varianza y desviación estándar.
- Medidas descriptivas calculadas sobre el día ordinal del año, con aclaración metodológica.
- Tabla de frecuencias por mes, día del mes, fechas exactas repetidas e intervalos de 30 días.
- Comparación diferenciada entre proporción observada en los datos simulados y probabilidad teórica.
- Exportación de las tablas de frecuencias a CSV.
- Control deslizante para consultar la probabilidad de cualquier tamaño de grupo.
- Búsqueda y filtros en los 100 registros.
- Exportación de la base a CSV.

## Nota metodológica importante
Los 100 registros son **simulados** y deben presentarse como tales, no como una encuesta real. El cálculo teórico supone 365 días igualmente probables, independencia entre cumpleaños y excluye el 29 de febrero. La probabilidad teórica de coincidencia para n personas se calcula como:

P(coincidencia) = 1 - (365/365 × 364/365 × ... × (365-n+1)/365)

Los conteos del dashboard se calculan desde `data.js`; no están escritos manualmente en los indicadores. Las medidas numéricas se calculan convirtiendo cada fecha a su día ordinal (1–365); los meses se tratan como categorías y no se les calcula media. La media y dispersión del día ordinal se interpretan con cautela porque las fechas del calendario son cíclicas.
