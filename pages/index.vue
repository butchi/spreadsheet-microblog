<script setup>
const runtimeConfig = useRuntimeConfig()

const { sheetUrl } = runtimeConfig

const { data: sheetData } = await useFetch(sheetUrl)
</script>

<template>
    <main>
        <p>index page</p>
    </main>
</template>

<script>
import Papa from "papaparse"

export default {
    computed: {
        postArr() {
            return Papa.parse(this.sheetData).data.slice(1)
        },
    },
    methods: {
        dateRelative(date) {
            const dateTime = DateTime.fromFormat(date, "yyyy/MM/dd hh:mm:ss")

            const d = Math.round(- dateTime.diffNow("days").days)
            const h = Math.round(- dateTime.diffNow("hours").hours)
            const m = Math.round(- dateTime.diffNow("minutes").minutes)
            const s = Math.round(- dateTime.diffNow("seconds").seconds)

            return d ? `${d}日前` : h ? `${h}時間前` : m ? `${m}分前` : s ? `${s}秒前` : ""
        }
    },
}
</script>