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
                    <v-card>
                        <v-card-text>
                            <v-form>
                                <v-textarea v-model="postTxt"></v-textarea>
                            </v-form>
                        </v-card-text>
                        <v-card-actions>
                            <v-btn color="primary" @click="submitForm" @submit="isOpenDialog = false">送信</v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>
            </v-col>
            <v-col cols="12" md="5">
                <v-card class="ma-3" v-for="post in postArrDesc" :key="`${post.authorId} ${post.date}`">
                    <v-list-item class="w-100" three-line>
                        <template v-slot:prepend>
                            <v-avatar v-if="post.authorAvatar" :image="post.authorAvatar"></v-avatar>
                            <v-avatar v-else color="grey-darken-3">
                                <v-icon>mdi-account</v-icon>
                            </v-avatar>
                        </template>

                        <v-list-item-title>{{ post.authorName }}</v-list-item-title>

                        <v-list-item-subtitle>@{{ post.authorSlug }}</v-list-item-subtitle>

                        <v-list-item-subtitle>{{ dateRelative(post.date) }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-card-text v-if="post.text">
                        {{ post.text }}
                    </v-card-text>
                    <v-card-text v-else class="font-italic">
                        sage
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
            <v-col md="3">{{ formInfoObj }}</v-col>
        </v-row>
    </main>
</template>

<script>
import axios from "axios"
import Papa from "papaparse"
import { DateTime } from "luxon"

export default {
    data: () => ({
        isOpenDialog: false,
        curUser: { name: "", slug: "" },
        userArr: [],
        postArr: [],
        postTxt: "",
        formInfoObj: {},
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
        postArrDesc() {
            const timeValue = dateStr => DateTime.fromFormat(dateStr, "yyyy/MM/dd hh:mm:ss").valueOf()

            return this.postArr.slice().sort((a, b) => timeValue(a.date) - timeValue(b.date)).reverse()
        },
    },
    methods: {
        dateRelative(dateStr) {
            const dateTime = DateTime.fromFormat(dateStr, "yyyy/MM/dd hh:mm:ss")

            const d = Math.round(- dateTime.diffNow("days").days)
            const h = Math.round(- dateTime.diffNow("hours").hours)
            const m = Math.round(- dateTime.diffNow("minutes").minutes)
            const s = Math.round(- dateTime.diffNow("seconds").seconds)

            return d ? `${d}日前` : h ? `${h}時間前` : m ? `${m}分前` : s ? `${s}秒前` : ""
        },
        submitForm({ text, parent, action }) {
            const [nameText, nameParent, nameAction] = this.formInfoObj.nameArr
            const submitParams = new FormData()
            text && submitParams.append(nameText, text);
            parent && submitParams.append(nameParent, parent);
            action && submitParams.append(nameAction, action);
            const CORS_PROXY = "https://cors-anywhere.herokuapp.com/"
            const GOOGLE_FORM_ACTION = this.formInfoObj.formAttr.action
            axios.post(CORS_PROXY + GOOGLE_FORM_ACTION, submitParams).then(() => {
                this.isOpenDialog = false
            })
        },
    },
    async mounted() {
        const res = await fetch(this.$config.masterSheetUrl)

        const userCsvTxt = await res.text()

        this.userArr = Papa.parse(userCsvTxt).data.slice(1).map(([date, slug, name, avatar, sheetUrl]) => ({ date, slug, name, avatar, sheetUrl }))

        this.curUser = this.userArr[0]

        this.postArr = (await Promise.all(
            this.userArr.map(async user => {
                const res = await fetch(user.sheetUrl)

                const postCsvTxt = await res.text()

                const authorSlug = user.slug
                const authorName = user.name
                const authorAvatar = user.avatar

                const arr = Papa.parse(postCsvTxt, { header: true }).data.map(obj => ({
                    ...obj,
                    date: obj["タイムスタンプ"],
                    authorSlug,
                    authorName,
                    authorAvatar,
                }))

                return arr
            })
        )).flat()

        this.formInfoObj = await (await fetch(`/.netlify/functions/hello?q=${encodeURIComponent(this.$config.formAlice)}`)).json()
        // this.message = await (await fetch(`/.netlify/functions/hello?q=${encodeURIComponent(this.curUser.formUrl)}`)).text()
    },
}
</script>