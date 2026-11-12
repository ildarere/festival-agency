# resources/

Ресурсы для релизной сборки EWA (electron-builder, `buildResources: resources`).

Перед упаковкой (`npm run build:win` / `npm run build:mac`) положите сюда реальные
иконки приложения — сейчас это только заглушки путей в `electron-builder.yml`:

| Файл         | Платформа | Требования                          |
|--------------|-----------|-------------------------------------|
| `icon.ico`   | Windows   | многоразмерный ICO, включая 256×256 |
| `icon.icns`  | macOS     | ICNS, включая 512×512@2x            |

Компиляция и dev-режим (`npm run build`, `npm run dev`) работают без этих файлов.
