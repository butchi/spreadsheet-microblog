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

                <v-btn class="mt-5" color="primary" rounded block @click="isOpenDialog = true">つぶやく</v-btn>

                <v-select class="mt-15" v-model="curUserSlug" :items="userLi" item-title="name" item-value="slug">
                </v-select>

                <v-dialog v-model="isOpenDialog" width="640" height="439">
                    <iframe :src="`${curUser.formUrl}/viewform?embedded=true`" width="640" height="439" frameborder="0"
                        marginheight="0" marginwidth="0">読み込んでいます…</iframe>
                </v-dialog>
            </v-col>
            <v-col md="5">
                <v-card class="mt-3" v-for="post in postArr.slice().reverse()" :key="`${post.authorId} ${post.date}`">
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
        curUserSlug: "anonymous",
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
        curUser() {
            return this.userArr.filter(user => user.slug === this.curUserSlug)[0]
        },
        userLi() {
            return this.userArr.map(user => ({
                slug: user.slug,
                name: user.name,
            }))
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

        this.userArr.forEach(user => {
            fetch(user.sheetUrl).then(res => {
                res.text().then(postCsvTxt => {
                    const authorSlug = user.slug
                    const authorName = user.name
                    const authorImg = user.img

                    const arr = Papa.parse(postCsvTxt).data.slice(1).map(([date, text]) => ({ authorSlug, authorName, authorImg, date, text }))

                    this.postArr = this.postArr.concat(arr)
                })
            })
        })
    },
}
</script>