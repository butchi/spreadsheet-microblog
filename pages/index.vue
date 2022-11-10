<script setup>
const runtimeConfig = useRuntimeConfig()

const { sheetUrl } = runtimeConfig

const { data: sheetData } = await useFetch(sheetUrl)
</script>

<template>
    <main>
        <v-row justify="center">
            <v-col lg="2" md="3">
                <v-list density="compact">
                    <v-list-subheader>
                        Spreadsheet Microblog Demo
                    </v-list-subheader>

                    <v-list-item v-for="(item, i) in menuItemArr" :key="i" :value="item" active-color="primary">
                        <template v-slot:prepend>
                            <v-icon :icon="item.icon"></v-icon>
                        </template>

                        <v-list-item-title v-text="item.text"></v-list-item-title>
                    </v-list-item>
                </v-list>

                <v-btn class="mt-5" color="primary" rounded block>つぶやく</v-btn>
            </v-col>
            <v-col md="5">
                <v-card class="mt-3" v-for="post in postArr.slice().reverse()" :key="post[0]">
                    <v-list-item class="w-100" three-line>
                        <template v-slot:prepend>
                            <v-avatar color="grey-darken-3"
                                image="https://avataaars.io/?avatarStyle=Transparent&topType=ShortHairShortCurly&accessoriesType=Prescription02&hairColor=Black&facialHairType=Blank&clotheType=Hoodie&clotheColor=White&eyeType=Default&eyebrowType=DefaultNatural&mouthType=Default&skinColor=Light">
                            </v-avatar>
                        </template>

                        <v-list-item-title>山田太郎</v-list-item-title>

                        <v-list-item-subtitle>@yamada_t</v-list-item-subtitle>

                        <v-list-item-subtitle>{{ dateRelative(post[0]) }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-card-text>
                        {{ post[1] }}
                    </v-card-text>
                    <v-card-actions>
                        <v-btn rounded small disabled>
                            <v-icon class="mr-1" icon="mdi-comment"></v-icon>
                            {{ 0 }}
                        </v-btn>
                        <v-btn rounded small disabled>
                            <v-icon class="mr-1" icon="mdi-repeat"></v-icon>
                            {{ 0 }}
                        </v-btn>
                        <v-btn rounded small disabled>
                            <v-icon class="mr-1" icon="mdi-heart"></v-icon>
                            {{ 0 }}
                        </v-btn>
                        <v-btn rounded small disabled>
                            <v-icon class="mr-1" icon="mdi-share"></v-icon>
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>
            <v-col md="3"></v-col>
        </v-row>
    </main>
</template>

<script>
import Papa from "papaparse"
import { DateTime } from "luxon"

export default {
    data: () => ({
        menuItemArr: [
            {
                text: "ホーム",
                icon: "mdi-home",
                value: 1,
            },
            {
                text: "通知",
                icon: "mdi-bell",
                value: 2,
            },
            {
                text: "プロフィール",
                icon: "mdi-account",
                value: 3,
            },
        ],
    }),
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