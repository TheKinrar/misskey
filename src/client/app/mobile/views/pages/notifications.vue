<template>
<mk-ui>
	<span slot="header">%fa:R bell%%i18n:@notifications%</span>
	<template slot="func"><button @click="fn">%fa:check%</button></template>
	<mk-notifications @fetched="onFetched"/>
</mk-ui>
</template>

<script lang="ts">
import Vue from 'vue';
import Progress from '../../../common/scripts/loading';

export default Vue.extend({
	mounted() {
		document.title = 'Misskey | %i18n:@notifications%';
		document.documentElement.style.background = '#313a42';

		Progress.start();
	},
	methods: {
		fn() {
			const ok = window.confirm('%i18n:!@read-all%');
			if (!ok) return;

			(this as any).api('notifications/markAsRead_all');
		},
		onFetched() {
			Progress.done();
		}
	}
});
</script>
