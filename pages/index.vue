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
}
</script>