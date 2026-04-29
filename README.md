# EducaLink

Una red social y marketplace pensada para **maestros de preescolar y primaria**, donde pueden comunicarse, compartir material didáctico y vender o intercambiar recursos para sus aulas.

## ¿Qué hace la app?

EducaLink resuelve el problema de que el material y la experiencia docente suelen quedarse encerrados en cada salón. La aplicación les da a los profesores un espacio común para:

- **Compartir material** — subir y descargar libros en PDF, imágenes, documentos y otros recursos didácticos a través de publicaciones.
- **Conversar en foros** — agruparse en foros temáticos, **públicos o privados** (con contraseña), filtrados por nivel educativo (preescolar / primaria) y grado.
- **Publicar y comentar posts** — crear publicaciones dentro de un foro y comentarlas para discutir contenidos, dudas o propuestas pedagógicas.
- **Seguir a otros docentes** — construir una red personal de contactos y ver su actividad.
- **Chatear en privado** — mensajería directa uno a uno entre usuarios.
- **Marketplace** — publicar artículos en venta o intercambio (por ejemplo material escolar, libros usados, recursos impresos) con su propio canal de chat de ventas independiente del chat general.
- **Anuncios** — el **administrador** puede crear anuncios (`Ads`) que aparecen intercalados entre los posts del feed.

## ¿Para quién es?

- Profesores de **preescolar y primaria** que quieren intercambiar material y experiencias.
- Comunidades escolares que necesiten foros privados (por escuela, zona, grado, etc.).
- Docentes que quieran un canal sencillo para vender o intercambiar recursos didácticos.

## Stack

- **Angular 18** (componentes standalone, sin NgModules) + TypeScript
- **PrimeNG 17** + **primeicons** (tema `lara-light-blue`)
- **Tailwind CSS 3** para utilidades de layout
- **ngx-toastr** para notificaciones
- **Quill** para edición de texto enriquecido
- **RxJS** para flujo de datos
- Backend HTTP REST consumido vía `HttpClient` (la API vive en otro repo)

Gestor de paquetes: **pnpm**.

## Cómo correr el proyecto

```bash
pnpm install
pnpm start              # dev server en http://localhost:4200
pnpm build              # build de producción a dist/integrador
pnpm test               # suite de Karma + Jasmine
```

El `dev server` usa `src/environments/environment.development.ts`. El build de producción usa `src/environments/environment.ts`. Cambia `apiUrl` ahí si necesitas apuntar a otro backend.

## Arquitectura

```
src/
├── app/
│   ├── app.config.ts          # Providers globales (router, http, toastr, animations)
│   ├── app.routes.ts          # Tabla de rutas (todas protegidas salvo / y /register)
│   ├── auth/
│   │   ├── auth.service.ts    # JWT + usuario en localStorage, headers autenticados
│   │   └── auth.guard.ts      # CanActivateFn que redirige a / si no hay sesión
│   ├── services/              # Un servicio por recurso del backend
│   │   ├── user.service.ts    #   usuarios, follow/unfollow, sugerencias
│   │   ├── forum.service.ts   #   foros (crear, unirse, salir, filtros por grado/nivel)
│   │   ├── post.service.ts    #   posts, comentarios por post, posts por foro
│   │   ├── comment.service.ts
│   │   ├── chat.service.ts    #   chat general y chat de ventas (endpoints separados)
│   │   ├── sale.service.ts    #   marketplace
│   │   ├── ad.service.ts      #   anuncios del administrador
│   │   └── search.service.ts
│   ├── models/                # Interfaces TypeScript (I*) que reflejan el backend
│   ├── pages/                 # Componentes ruteados
│   └── components/            # UI reutilizable (navbar, post, chat, sale-modal, etc.)
└── environments/              # Config por entorno (dev / prod)
```

### Cómo fluye una petición

1. El usuario inicia sesión en `LoginComponent`. `AuthService.login()` envía credenciales como `FormData` al endpoint `/token` del backend.
2. El JWT recibido se guarda con `setToken()` y queda persistido en `localStorage`. El usuario también se guarda como JSON.
3. El `authGuard` (`CanActivateFn`) protege todas las rutas excepto `/` y `/register`. Si `AuthService.isLogged()` es `false`, redirige al login.
4. Cada servicio (`PostService`, `ForumService`, etc.) construye sus headers vía `authService.getHttpOptions()`, que añade `Authorization: Bearer <token>` cuando hay sesión.
5. Los componentes consumen los `Observable<...>` de los servicios y renderizan con la combinación PrimeNG + Tailwind.

### Auth

- Hay un único `AuthService` (`providedIn: 'root'`) que es la fuente de verdad de la sesión.
- El token y el usuario se persisten en `localStorage`, con guardas `isPlatformBrowser(PLATFORM_ID)` para no romper si la app se ejecuta fuera del navegador (resto de la era SSR — actualmente la app es SPA pura).
- `getHttpOptions()` produce los headers JSON autenticados; para subidas multipart (avatares, imágenes de posts, foros, anuncios, ventas) se construyen headers manuales con sólo `Authorization` para que el navegador defina el `Content-Type: multipart/form-data; boundary=...`.

### Routing

Todas las rutas viven en `src/app/app.routes.ts`:

| Ruta                       | Componente              | Protegida |
|----------------------------|-------------------------|-----------|
| `/`                        | `LoginComponent`        | no        |
| `/register`                | `RegisterComponent`     | no        |
| `/home`                    | `HomeComponent`         | sí        |
| `/forum`                   | `ForumComponent`        | sí        |
| `/createforum`             | `NewforumComponent`     | sí        |
| `/editforum`               | `EditforumComponent`    | sí        |
| `/search-forum`            | `SearchForumComponent`  | sí        |
| `/createpost`              | `CreatePostComponent`   | sí        |
| `/comments`                | `CommentsComponent`     | sí        |
| `/profile/:id_user`        | `ProfileComponent`      | sí        |
| `/editprofile`             | `EditProfileComponent`  | sí        |
| `/user-forums`             | `UserForumsComponent`   | sí        |
| `/user-following`          | `UserFollowingComponent`| sí        |
| `/myfollows`               | `MyfollowsComponent`    | sí        |
| `/sale`                    | `VentasComponent`       | sí        |
| `/salepost`                | `CreateSalePostComponent`| sí       |
| `/sale-chat`               | `SaleChatComponent`     | sí        |
| `/chat`                    | `ChatComponent`         | sí        |
| `/ads`                     | `AdsComponent`          | sí        |
| `/info`, `/help-section`   | ayuda / manual          | sí        |
| `/categories/:category`    | `InfoComponent`         | sí        |

### Modelos

Las interfaces en `src/app/models/` (`IUserData`, `IPost`, `IForum`, `IComment`, `IChat`, `IMessage`, `ISalePost`, `ISaleChat`, `ISaleMessage`, `IAd`, `ICompany`) reflejan exactamente los campos del backend en **snake_case** (`id_user`, `profile_image_url`, `education_level`, `id_sale_post`, …). No los renombres a camelCase porque romperás el contrato con la API.

## Cosas destacables del código

- **Componentes 100% standalone**. Cada componente declara sus propios `imports`. No hay `AppModule`.
- **Convención `setTempId` / `getTempId`** — varios servicios (`UserService`, `ForumService`, `PostService`) exponen este par para pasar un id de entidad entre páginas sin meterlo en query params. La página origen llama `setTempId(id)` antes de navegar y la destino lo lee en `ngOnInit`. Mantén el patrón si añades flujos similares.
- **Foros con doble dimensión de búsqueda** — `ForumService` ofrece queries combinadas por `grade` y `education_level`, y endpoints `/not_in/` para mostrar foros a los que el usuario *aún no pertenece*. Los foros también pueden ser privados, en cuyo caso `joinForum()` envía un `password` como query param.
- **Dos sistemas de chat paralelos** — el chat general (`/chat`, `/message`) y el chat de ventas (`/sale_chat`, `/sale_message`) viven separados en backend y frontend para que las conversaciones de marketplace no se mezclen con las sociales. Ambos están encapsulados en `ChatService`.
- **Anuncios intercalados en el feed** — `AdService` (sólo gestionable por admin desde `/ads`) crea entidades `IAd` que el componente `AdComponent` renderiza intercaladas con los posts del home.
- **Budgets de producción agresivos** — `angular.json` impone `initial: 1MB error` y `anyComponentStyle: 4kB error`. Si tu build prod falla, probablemente tienes un CSS de componente demasiado grande; mueve las reglas a Tailwind o a `styles.css`.
- **Idioma del proyecto** — los comentarios, mensajes de toast y nombres de variables de dominio están en español. Cualquier texto nuevo de UI debe seguir esa convención.

## Documentación adicional para Claude Code

Si trabajas con Claude Code en este repo, revisa también [`CLAUDE.md`](./CLAUDE.md) — contiene notas operativas (gotchas de `FormData`, idioms de servicios, guardas SSR remanentes) que aceleran el onboarding del agente.
