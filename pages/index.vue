<template>
    <main>
        <v-row justify="center">
            <v-col class="ma-3" lg="2" md="3">
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

                <v-btn class="mt-5" color="primary" rounded block @click="isOpenDialog = true">つぶやく</v-btn>

                <v-select class="mt-5" v-model="curUser" :items="userArr" item-title="name" item-value="slug"
                    :hint="`${curUser.slug && '@' + curUser.slug}`" label="ユーザー" persistent-hint return-object>
                </v-select>

                <v-dialog v-model="isOpenDialog" width="640" height="439">
                    <iframe :src="`${curUser.formUrl}/viewform?embedded=true`" width="640" height="439" frameborder="0"
                        marginheight="0" marginwidth="0">読み込んでいます…</iframe>
                </v-dialog>
            </v-col>
            <v-col cols="12" md="5">
                <v-card class="ma-3" v-for="post in postArrDesc" :key="`${post.authorId} ${post.date}`">
                    <v-list-item class="w-100" three-line>
                        <template v-slot:prepend>
                            <v-avatar v-if="post.authorImg" :image="post.authorImg"></v-avatar>
                            <v-avatar v-else color="grey-darken-3">
                                <v-icon>mdi-account</v-icon>
                            </v-avatar>
                        </template>

                        <v-list-item-title>{{ post.authorName || defaultName }}</v-list-item-title>

                        <v-list-item-subtitle>@{{ post.authorSlug || defaultSlug }}</v-list-item-subtitle>

                        <v-list-item-subtitle>{{ dateRelative(post.date) }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-card-text>
                        {{ post.text }}
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
        isOpenDialog: false,
        curUser: { name: "", slug: "" },
        userArr: [],
        postArr: [],
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
        defaultSlug: "anonymous",
        defaultName: "匿名",
    }),
    computed: {
        postArrDesc() {
            const timeValue = dateStr => DateTime.fromFormat(dateStr, "yyyy/MM/dd hh:mm:ss").valueOf()

            return this.postArr.slice().sort((a, b) => timeValue(a.date) - timeValue(b.date)).reverse()
        },
    },
    methods: {
        dateRelative(dateStr) {
            const dateTime = DateTime.fromFormat(dateStr, "yyyy/MM/dd hh:mm:ss").plus({ hours: 9 })

            const d = Math.round(- dateTime.diffNow("days").days)
            const h = Math.round(- dateTime.diffNow("hours").hours)
            const m = Math.round(- dateTime.diffNow("minutes").minutes)
            const s = Math.round(- dateTime.diffNow("seconds").seconds)

            return d ? `${d}日前` : h ? `${h}時間前` : m ? `${m}分前` : s ? `${s}秒前` : ""
        }
    },
    async mounted() {
        const res = await fetch(this.$config.sheetUrl)

        const userCsvTxt = await res.text()

        this.userArr = Papa.parse(userCsvTxt).data.slice(1).map(([date, slug, name, sheetUrl, formUrl, img]) => ({ date, slug, name, sheetUrl, formUrl, img }))

        this.curUser = Object.assign({}, this.userArr.filter(user => user.slug === "anonymous")[0])

        this.postArr = (await Promise.all(
            this.userArr.map(async user => {
                const res = await fetch(user.sheetUrl)

                const postCsvTxt = await res.text()

                const authorSlug = user.slug
                const authorName = user.name
                const authorImg = user.img

                const arr = Papa.parse(postCsvTxt).data.slice(1).map(([date, text]) => ({ authorSlug, authorName, authorImg, date, text }))

                return arr
            })
        )).flat()
    },
}
</script>