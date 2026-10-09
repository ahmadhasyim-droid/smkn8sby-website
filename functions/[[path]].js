// Cloudflare Pages Functions: semua permintaan non-statis diteruskan ke aplikasi.
import { handle } from '../src/app.js';

export const onRequest = (context) => handle(context.request, context.env);
