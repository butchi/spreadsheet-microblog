const title = "スプレッドシートマイクロブログ デモ"
const desc = "GoogleスプレッドシートでTwitterのようなマイクロブログを実現するデモです。"

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
    app: {
        head: {
            charset: "utf-8",
            viewport: "width=device-width, initial-scale=1",
            title: title,
            meta: [
                { name: 'og:title', content: title },
                { name: 'description', content: desc },
                { name: 'og:description', content: desc },
            ],
        }
    },
    css: ["vuetify/lib/styles/main.sass", "mdi/css/materialdesignicons.min.css"],
    build: {
        transpile: ["vuetify"],
    },
    vite: {
        define: {
            "process.env.DEBUG": false,
        },
    },
    publicRuntimeConfig: {
        masterSheetUrl: process.env.MASTER_SHEET_URL,
        formAlice: process.env.FORM_ALICE
    },
})
