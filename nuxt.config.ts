// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
    app: {
        head: {
            charset: 'utf-8',
            viewport: 'width=device-width, initial-scale=1',
            title: 'スプレッドシートマイクロブログ デモ',
            meta: [
                { name: 'description', content: 'GoogleスプレッドシートでTwitterのようなマイクロブログを実現するデモです。' }
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
        sheetUrl: process.env.SHEET_URL,
    },
})
