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
