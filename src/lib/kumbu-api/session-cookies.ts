/** Cookies isolados do site — evita sessão de utilizador C2C abrir o painel admin. */
export const ADMIN_ACCESS_COOKIE = "kumbu_admin_access_token";
export const ADMIN_REFRESH_COOKIE = "kumbu_admin_refresh_token";

/** Duração da sessão admin no browser (refresh token). */
export const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
