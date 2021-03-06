<template>
<div class="mk-timeline">
	<mk-friends-maker v-if="alone"/>
	<div class="fetching" v-if="fetching">
		<mk-ellipsis-icon/>
	</div>
	<p class="empty" v-if="notes.length == 0 && !fetching">
		%fa:R comments%%i18n:@empty%
	</p>
	<mk-notes :notes="notes" ref="timeline">
		<button slot="footer" @click="more" :disabled="moreFetching" :style="{ cursor: moreFetching ? 'wait' : 'pointer' }">
			<template v-if="!moreFetching">%i18n:@load-more%</template>
			<template v-if="moreFetching">%fa:spinner .pulse .fw%</template>
		</button>
	</mk-notes>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import { url } from '../../../config';

export default Vue.extend({
	data() {
		return {
			fetching: true,
			moreFetching: false,
			existMore: false,
			notes: [],
			connection: null,
			connectionId: null,
			date: null,
			isTop: true
		};
	},
	computed: {
		alone(): boolean {
			return (this as any).os.i.followingCount == 0;
		}
	},
	mounted() {
		this.connection = (this as any).os.stream.getConnection();
		this.connectionId = (this as any).os.stream.use();

		this.connection.on('note', this.onNote);
		this.connection.on('follow', this.onChangeFollowing);
		this.connection.on('unfollow', this.onChangeFollowing);

		document.addEventListener('keydown', this.onKeydown);
		window.addEventListener('scroll', this.onScroll);

		this.fetch();
	},
	beforeDestroy() {
		this.connection.off('note', this.onNote);
		this.connection.off('follow', this.onChangeFollowing);
		this.connection.off('unfollow', this.onChangeFollowing);
		(this as any).os.stream.dispose(this.connectionId);

		document.removeEventListener('keydown', this.onKeydown);
		window.removeEventListener('scroll', this.onScroll);
	},
	methods: {
		fetch(cb?) {
			this.fetching = true;

			(this as any).api('notes/timeline', {
				limit: 11,
				untilDate: this.date ? this.date.getTime() : undefined
			}).then(notes => {
				if (notes.length == 11) {
					notes.pop();
					this.existMore = true;
				}
				this.notes = notes;
				this.fetching = false;
				this.$emit('loaded');
				if (cb) cb();
			});
		},
		more() {
			if (this.moreFetching || this.fetching || this.notes.length == 0 || !this.existMore) return;
			this.moreFetching = true;
			(this as any).api('notes/timeline', {
				limit: 11,
				untilId: this.notes[this.notes.length - 1].id
			}).then(notes => {
				if (notes.length == 11) {
					notes.pop();
				} else {
					this.existMore = false;
				}
				this.notes = this.notes.concat(notes);
				this.moreFetching = false;
			});
		},
		onNote(note) {
			// サウンドを再生する
			if ((this as any).os.isEnableSounds) {
				const sound = new Audio(`${url}/assets/post.mp3`);
				sound.volume = localStorage.getItem('soundVolume') ? parseInt(localStorage.getItem('soundVolume'), 10) / 100 : 0.5;
				sound.play();
			}

			if (this.isTop) this.notes.pop();
			this.notes.unshift(note);
		},
		onChangeFollowing() {
			this.fetch();
		},
		onScroll() {
			if ((this as any).os.i.clientSettings.fetchOnScroll !== false) {
				const current = window.scrollY + window.innerHeight;
				if (current > document.body.offsetHeight - 8) this.more();
			}
			this.isTop = window.scrollY < 100;
		},
		onKeydown(e) {
			if (e.target.tagName != 'INPUT' && e.target.tagName != 'TEXTAREA') {
				if (e.which == 84) { // t
					(this.$refs.timeline as any).focus();
				}
			}
		},
		warp(date) {
			this.date = date;
			this.fetch();
		}
	}
});
</script>

<style lang="stylus" scoped>
.mk-timeline
	background #fff
	border solid 1px rgba(0, 0, 0, 0.075)
	border-radius 6px

	> .mk-friends-maker
		border-bottom solid 1px #eee

	> .fetching
		padding 64px 0

	> .empty
		display block
		margin 0 auto
		padding 32px
		max-width 400px
		text-align center
		color #999

		> [data-fa]
			display block
			margin-bottom 16px
			font-size 3em
			color #ccc

</style>
